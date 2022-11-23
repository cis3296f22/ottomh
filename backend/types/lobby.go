package types

import (
	"encoding/json"
	"errors"
	"log"
	"math/rand"
	"time"

	"github.com/cis3296f22/ottomh/backend/config"
	"github.com/gin-gonic/gin"
	"strings"
)

var ErrDuplicateUser error = errors.New("User with given username already exists")

// A "Lobby" represents a game that is currently open or running.
type Lobby struct {
	ID          string
	userList    UserList
	userWords   *userWordsMap
	roundEnded  bool
	votingEnded bool
	lobbyEnded  bool
	totalScores map[string]int
}

// Initializes a new Lobby with a unique ID
func makeLobby(ID string) *Lobby {
	// For generating random numbers, we start by seeding rand
	rand.Seed(int64(time.Now().Second()))

	l := &Lobby{
		ID: ID,
		userList: UserList{
			sockets: make(map[string]*WebSocket),
		},
		userWords: New(), // create new userWordsMap
	}
	go l.lifecycle()
	return l
}

// This forever-loop continuosly checks WebSockets for messages from
// the client, and responds to those messages.
func (l *Lobby) lifecycle() {
	userPresent := 0 //number of user present to compare when sending crossed out words to userWordMap
	numReceived := 0

	crossedWordsMap := make(map[string]int)
	l.totalScores = make(map[string]int)
	// Loop over sockets, checking each for messages
	for {
		for _, socket := range l.userList.GetSocketList() {
			m, err := socket.ReadMessage()
			if err == nil { // If a message is currently available
				var packetIn WSPacket
				json.Unmarshal(m, &packetIn)

				// Handle messages here!
				switch packetIn.Event {
				case "endround":
					userPresent += 1
					if !l.roundEnded {
						// get all words submitted by every user
						var totalWordsArr []string = l.userWords.genWordsArr(packetIn.Data) // a list of all the user words that were entered
						log.Print("total words entered in lobby ", packetIn.Data, ": ", totalWordsArr)

						packetOut, _ := json.Marshal(map[string]interface{}{
							"Event": "endround",
							"TotalWordsArr": totalWordsArr,
						})
						l.userList.MessageAll(packetOut)
						l.roundEnded = true
					}
				case "endvoting":
					//break the crossed words to store in map
					str := strings.Split(packetIn.Data, ",")
					for _, s := range str {
						if s != "" {
							if _, ok := crossedWordsMap[s]; ok {
								crossedWordsMap[s] += 1
							} else {
								crossedWordsMap[s] = 1
							}
						}
					}

					// We only want to signal users to move to the next stage after
					// all users have signaled that they are ready to move on.
					numReceived += 1
					if numReceived == userPresent && !l.votingEnded {
						packetOut, _ := json.Marshal(map[string]interface{}{
							"Event": "endvoting",
						})

						l.userList.MessageAll(packetOut)
						l.votingEnded = true
						l.userWords.removingCrossedWords(crossedWordsMap, userPresent)

					}
				case "begingame":
					userPresent = 0                        //reset userpresent to 0 when user decides to reset game:::::
					numReceived = 0
					crossedWordsMap = make(map[string]int) // reset dictionary when game reset:::::
					// This is a new round, so we have not previously ended any stage
					l.roundEnded = false
					l.votingEnded = false
					// Select a random category and letter
					cat_i := rand.Intn(len(config.Categories))
					category := config.Categories[cat_i]
					// Recall that A has a byte value of 65, and there are 26 letters
					letter := string(byte(rand.Intn(26) + 65))

					// Tell all sockets to start the game
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event":    "begingame",
						"Category": category,
						"Letter":   letter,
					})
					l.userList.MessageAll(packetOut)
				case "getscores":
					//here should take map from voted page
					mapDemo := map[string][]string{
						"user7": {"one", "two", "three", "four", "five", "six"},
						"user2": {"one", "two", "three", "four", "five"},
						"user1": {"one", "two"},
						"user4": {"one", "two", "three", "four", "five", "six"},
						"user5": {"one", "two", "three", "four", "five", "six", "seven"},
						"a":     {"one", "two", "three", "four", "five", "six"},
					}
					//return a map [string]int username:score
					sm := CreateScores(mapDemo)
					//merge score map into total score map
					for key := range sm.scorem {
						l.totalScores[key] += sm.scorem[key]
					}
					//scorelist := sm.scorem
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event":  "getscores",
						"Scores": l.totalScores,
					})
					l.userList.MessageAll(packetOut)
				case "waitingRoom":
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event": "waitingRoom",
					})
					l.userList.MessageAll(packetOut)
				case "checkword":
					// declare reusable variables for this locality
					var word WordPacket // WordPacket type struct declared in userWords.go
					var isUnique bool   // if word submitted by user already exists in the user words map

					// convert the stringified json object from packetIn.Data into a WordPacket type
					err := json.Unmarshal([]byte(packetIn.Data), &word)
					if err != nil {
						log.Print("error occurred when trying to convert packetIn.Data to WordPacket struct -> error:  ", err)
					}

					// check if word is a duplicate
					isUnique = l.userWords.UserWords(word)

					// debugging
					// log.Print("packetIn: ", packetIn, " | word: ", word, " | isUnique: ", isUnique)

					// send isDup boolean result back to the frontend
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event":        "checkword",
						"isUniqueWord": isUnique,
						"Word":         word.Answer,
					})
					socket.WriteMessage(packetOut)
				default:
					log.Print("Recieved message from WebSocket: ", string(m))
					if err := socket.WriteMessage(m); err != nil {
						log.Print("Error writing message to WebSocket: ", err)
					}
				}
			} else if err == ErrClosedWebSocket {
				// Handle a WebSocket that has closed
			} else {
				socket.Ping()
			}
		}
	}
}

// Checks a few conditions on `username`:
// 1. `username` must not already exits
// 2. `l` must not be full according to game settings
func (l *Lobby) ValidateUsername(username string) error {
	exists := l.userList.ContainsUser(username)
	if exists {
		return ErrDuplicateUser
	}
	return nil
}

// Tries to open a WebSocket with the given context
func (l *Lobby) acceptWebSocket(c *gin.Context, username string, host string) error {
	// First, "upgrade" the HTTP connection to a WebSocket connection
	ws, err := MakeWebSocket(c.Writer, c.Request, nil)
	if err != nil {
		return err
	}

	log.Print("Adding user ", username)

	// Append new Socket
	l.userList.AddSocket(username, ws, host)

	log.Print("Added user ", username)

	return nil
}

func (l *Lobby) Close() {
	l.lobbyEnded = true
}
