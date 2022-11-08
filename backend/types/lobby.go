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
	l := &Lobby{ID: ID}
	go l.lifecycle()
	return l, nil
}

// This forever-loop continuosly checks WebSockets for messages from
// the client, and responds to those messages.
func (l *Lobby) lifecycle() {
	// Loop over sockets, checking each for messages
	for {
		for i, user := range l.userList.GetUsers() {
			if user.IsAlive() { // If WebSocket is still active, read from it
				m, err := user.ReadMessage()
				if err == nil { // If a message is currently available
					var packetIn WSPacket
					json.Unmarshal(m, &packetIn)

					log.Println(m)
					log.Println(packetIn.Event, packetIn.Data)

					// Handle messages here!
					switch packetIn.Event {
					case "adduser":
						if len(packetIn.Data) > 0 {
							user.UpdateUsername(packetIn.Data)
							packetOut, _ := json.Marshal(map[string]interface{}{
								"Event": "updateusers",
								"List":  l.userList.GetUsernameList(),
								"Host":  l.userList.GetHost(),
							})
							l.userList.MessageAll(packetOut)
						}
					case "addhost":
						if len(packetIn.Data) > 0 {
							l.userList.SetHost(packetIn.Data)
							packetOut, _ := json.Marshal(map[string]interface{}{
								"Event": "updateusers",
								"List":  l.userList.GetUsernameList(),
								"Host":  l.userList.GetHost(),
							})
							l.userList.MessageAll(packetOut)
						}
					default:
						log.Print("Recieved message from WebSocket: ", m)
						if err := user.WriteMessage(m); err != nil {
							log.Print("Error writing message to WebSocket: ", err)
						}
					}
				} else { // Else, there is no message, so ping to keep it alive
					user.Ping()
				}

				i += 1
			} else { // Otherwise, remove the WebSocket from slice
				l.userList.SetInactive(i)
			}
		}
	}
}

// Tries to open a WebSocket with the given context
func (l *Lobby) acceptWebSocket(c *gin.Context) error {
	// First, "upgrade" the HTTP connection to a WebSocket connection
	ws, err := MakeWebSocket(c.Writer, c.Request, nil)
	if err != nil {
		return err
	}

	// Append new Socket
	l.userList.AddSocket(ws)

	return nil
}
