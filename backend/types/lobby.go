package types

import (
	"encoding/json"
	"log"
	"math/rand"
	"time"

	"github.com/cis3296f22/ottomh/backend/config"
	"github.com/gin-gonic/gin"
)

// A "Lobby" represents a game that is currently open or running.
type Lobby struct {
	ID          string
	userList    UserList
	roundEnded  bool
	votingEnded bool
}

// Initializes a new Lobby with a unique ID
func makeLobby(ID string) (*Lobby, error) {
	// For generating random numbers, we start by seeding rand
	rand.Seed(int64(time.Now().Second()))

	l := &Lobby{
		ID: ID,
		userList: UserList{
			sockets: make(map[string]*WebSocket),
		},
	}
	go l.lifecycle()
	return l, nil
}

// This forever-loop continuosly checks WebSockets for messages from
// the client, and responds to those messages.
func (l *Lobby) lifecycle() {
	// Loop over sockets, checking each for messages
	for {
		for _, socket := range l.userList.GetSocketList() {
			if socket.IsAlive() { // If WebSocket is still active, read from it
				m, err := socket.ReadMessage()
				if err == nil { // If a message is currently available
					var packetIn WSPacket
					json.Unmarshal(m, &packetIn)

					// Handle messages here!
					switch packetIn.Event {
					case "endround":
						if !l.roundEnded {
							packetOut, _ := json.Marshal(map[string]interface{}{
								"Event": "endround",
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
						//sm := CreateScores()
						//scorelist := sm.scorem
						demoTest := "helloworld"
						packetOut, _ := json.Marshal(map[string]interface{}{
							"Event":  "getscores",
							"Scores": demoTest,
						})
						l.userList.MessageAll(packetOut)
					default:
						log.Print("Recieved message from WebSocket: ", m)
						if err := socket.WriteMessage(m); err != nil {
							log.Print("Error writing message to WebSocket: ", err)
						}
					}
				} else { // Else, there is no message, so ping to keep it alive
					socket.Ping()
				}
			}
		}
	}
}

// Checks a few conditions on `username`:
// 1. `username` must not already exits
// 2. `l` must not be full according to game settings
func (l *Lobby) ValidateUsername(username string) error {
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
