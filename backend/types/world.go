package types

import (
	"sync"

	"github.com/gin-gonic/gin"
)

// The `World` is a collection of all active lobbies,
// and handles the process of routing
type World struct {
	mu       sync.Mutex // To add a new Lobby, need to acquire lock
	LobbyIDs []string
	Lobbies  []Lobby
}

// Creates a new Lobby in the World, and sends a response to
// the Context contains a unique URL representing that Lobby.
func (w *World) CreateLobby(c *gin.Context) {
}

// Connects to a Lobby given it's URL. If the URL is valid,
// a websocket will be opened on the Context.
// If the URL is invalid, an error response will be sent over the Context.
func (w *World) ConnectToLobby(URL string, c *gin.Context) {

}
