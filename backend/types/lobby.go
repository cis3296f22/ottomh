package types

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// A "Lobby" represents a game that is currently open or running.
type Lobby struct {
	ID string
}

// Initializes a new Lobby with a unique ID
func makeLobby(ID string) (Lobby, error) {
	return Lobby{ID: ID}, nil
}

// Tries to open a WebSocket with the given context
func (l *Lobby) acceptWebSocket(c *gin.Context) error {
	// First, "upgrade" the HTTP connection to a WebSocket connection
	ws, err := MakeWebSocket(c.Writer, c.Request, nil)
	if err != nil {
		return err
	}

	go l.handleWebSocket(ws.ws)

	return nil
}

// Internal function that maintains the WebSocket, responding
// to message as they appear
func (l *Lobby) handleWebSocket(ws *websocket.Conn) {
	defer ws.Close()

	for {
		mt, message, err := ws.ReadMessage()
		if err != nil {
			log.Print("Error reading over web socket: ", err)
			return
		}

		log.Print("Echoing message: ", string(message[:]))

		err = ws.WriteMessage(mt, message)
		if err != nil {
			log.Print("Error writing over web socket: ", err)
			return
		}
	}
}
