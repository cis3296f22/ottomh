package types

import (
	"log"

	"github.com/gin-gonic/gin"
)

// A "Lobby" represents a game that is currently open or running.
type Lobby struct {
	addSocketChan chan *WebSocket
	ID            string
	sockets       []*WebSocket // Do not modify directly; instead send new sockets to `addSocketChan`
}

// Initializes a new Lobby with a unique ID
func makeLobby(ID string) (*Lobby, error) {
	l := &Lobby{addSocketChan: make(chan *WebSocket, 5), ID: ID}
	go l.lifecycle()
	return l, nil
}

// This forever-loop continuosly checks WebSockets for messages from
// the client, and responds to those messages.
func (l *Lobby) lifecycle() {
	for {
		// If there new WebSockets, add them to the list
		for {
			select {
			case ws := <-l.addSocketChan:
				l.sockets = append(l.sockets, ws)
			default:
				// Need to use goto to break out of for-loop
				goto LOOP
			}
		}

		// Loop over sockets, checking each for messages
	LOOP:
		for i := 0; i < len(l.sockets); {
			ws := l.sockets[i]
			if ws.IsAlive() { // If WebSocket is still active, read from it
				m, err := ws.ReadMessage()
				if err == nil {
					// Handle messages here!
					log.Print("Recieved message from WebSocket: ", m)
					if err := ws.WriteMessage(m); err != nil {
						log.Print("Error write message to WebSocket: ", err)
					}
				}

				i += 1
			} else { // Otherwise, remove the WebSocket from slice
				// Remove element at i in constant time by overwriting with
				// last element in the slice.
				l.sockets[i] = l.sockets[len(l.sockets)-1]
				l.sockets = l.sockets[:len(l.sockets)-1]
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
	l.addSocketChan <- ws

	return nil
}
