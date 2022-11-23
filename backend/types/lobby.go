package types

import (
	"encoding/json"
	"errors"
	"log"
	"math/rand"
	"time"

	"github.com/cis3296f22/ottomh/backend/config"
	"github.com/gin-gonic/gin"
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
	// Loop over sockets, checking each for messages
	for {
		for _, socket := range l.userList.GetSocketList() {
			m, err := socket.ReadMessage()
			if err == nil { // If a message is currently available
				var packetIn WSPacket
				json.Unmarshal(m, &packetIn)

				// Handle messages here!
				switch packetIn.Event {
				case "checkword":
					var word WordPacket // WordPacket type struct declared in userWords.go
					var isDup bool      // if word submitted by user already exists in the user words map

					// convert the stringified json object from packetIn.Data into a WordPacket type
					err := json.Unmarshal([]byte(packetIn.Data), &word)
					if err != nil {
						log.Print("error occurred when trying to convert packetIn.Data to WordPacket struct -> error:  ", err)
					}

					// check if word is a duplicate
					isDup = l.userWords.UserWords(word)

					// send isDup boolean result back to the frontend
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event":     "checkword",
						"isDupWord": isDup,
						"Word":      word.Answer,
					})
					socket.WriteMessage(packetOut)
				case "endround":
					if !l.roundEnded {
						// get all words in the database
						var wordList []string = l.userWords.getWordsArr() // a list of all the user words that were entered
						log.Print("wordList: ", wordList)

						// send wordList array back to the frontend
						packetOut, _ := json.Marshal(map[string]interface{}{
							"Event":    "endround",
							"WordList": wordList,
						})
						l.userList.MessageAll(packetOut)
						l.roundEnded = true
					}
				case "endvoting":
					if !l.votingEnded {
						packetOut, _ := json.Marshal(map[string]interface{}{
							"Event": "endvoting",
						})
						l.userList.MessageAll(packetOut)
						l.votingEnded = true
					}
				case "begingame":
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
					sm := CreateScores()
					scorelist := sm.scorem
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event":  "getscores",
						"Scores": scorelist,
					})
					l.userList.MessageAll(packetOut)
				case "waitingRoom":
					packetOut, _ := json.Marshal(map[string]interface{}{
						"Event": "waitingRoom",
					})
					l.userList.MessageAll(packetOut)

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

// Closes the given lobby.
func (l *Lobby) Close() {
	l.lobbyEnded = true
}
