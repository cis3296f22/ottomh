package types

import (
	"encoding/json"
	"log"

	"github.com/gin-gonic/gin"
)

// A "Lobby" represents a game that is currently open or running.
type Lobby struct {
	ID       string
	userList UserList
}

// Initializes a new Lobby with a unique ID
func makeLobby(ID string) (*Lobby, error) {
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
		for _, socket := range l.userList.sockets {
			if socket.IsAlive() { // If WebSocket is still active, read from it
				m, err := socket.ReadMessage()
				if err == nil { // If a message is currently available
					var packetIn WSPacket
					json.Unmarshal(m, &packetIn)

					// Handle messages here!
					switch packetIn.Event {
					case "begingame":
						// Tell all sockets to start the game
						packetOut, _ := json.Marshal(map[string]interface{}{
							"Event": "begingame",
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
