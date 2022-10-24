package types

import (
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
func (*Lobby) acceptWebSocket(c *gin.Context) error {
	return nil
}

// Internal function that maintains the WebSocket, responding
// to message as they appear
func (*Lobby) handleWebSocket(ws *websocket.Conn) {

}
