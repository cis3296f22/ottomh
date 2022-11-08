package types

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gin-gonic/gin"
)

// A "Lobby" represents a game that is currently open or running.
type Lobby struct {
	addSocketChan chan *WebSocket
	ID            string
	socketsMu     sync.Mutex
	sockets       []*WebSocket // Do not modify directly; instead send new sockets to `addSocketChan`
	_users        []string
	host          string
}

// Initializes a new Lobby with a unique ID
func makeLobby(ID string) (*Lobby, error) {
	l := &Lobby{addSocketChan: make(chan *WebSocket, 5), ID: ID}
	go l.lifecycle()
	return l, nil
}

// Helper function for lifecycle() that sends a message to all websockets.
// Must acquire `socketsMu` before using.
func (l *Lobby) _writeAll(m []byte) {
	for _, socket := range l.sockets {
		socket.WriteMessage(m)
	}
}

// This forever-loop continuosly checks WebSockets for messages from
// the client, and responds to those messages.
func (l *Lobby) lifecycle() {
	for {
		// If there new WebSockets, add them to the list
		for {
			select {
			case ws := <-l.addSocketChan:
				l.socketsMu.Lock()
				l.sockets = append(l.sockets, ws)
				l.socketsMu.Unlock()
			default:
				// Need to use goto to break out of for-loop
				goto LOOP
			}
		}

		// Loop over sockets, checking each for messages
	LOOP:
		l.socketsMu.Lock()
		for i := 0; i < len(l.sockets); {
			ws := l.sockets[i]
			if ws.IsAlive() { // If WebSocket is still active, read from it
				m, err := ws.ReadMessage()
				if err == nil { // If a message is currently available
					var packetIn WSPacket
					json.Unmarshal(m, &packetIn)

					log.Println(m)
					log.Println(packetIn.Event, packetIn.Data)

					// Handle messages here!
					switch packetIn.Event {
					case "adduser":
						if len(packetIn.Data) > 0 {
							l._users = append(l._users, packetIn.Data)
							packetOut, _ := json.Marshal(map[string]interface{}{
								"Event": "updateusers",
								"List":  l._users,
								"Host":  l.host,
							})
							l._writeAll(packetOut)
						}
					case "addhost":
						if len(packetIn.Data) > 0 {
							l.host = packetIn.Data
							packetOut, _ := json.Marshal(map[string]interface{}{
								"Event": "updateusers",
								"List":  l._users,
								"Host":  l.host,
							})
							l._writeAll(packetOut)
						}
					default:
						log.Print("Recieved message from WebSocket: ", m)
						if err := ws.WriteMessage(m); err != nil {
							log.Print("Error writing message to WebSocket: ", err)
						}
					}
				} else { // Else, there is no message, so ping to keep it alive
					ws.Ping()
				}

				i += 1
			} else { // Otherwise, remove the WebSocket from slice
				// Remove element at i in constant time by overwriting with
				// last element in the slice.
				l.sockets[i] = l.sockets[len(l.sockets)-1]
				l.sockets = l.sockets[:len(l.sockets)-1]
			}
		}
		l.socketsMu.Unlock()
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
	l.addSocketChan <- ws

	return nil
}
