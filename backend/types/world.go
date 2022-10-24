package types

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// The `World` is a collection of all active lobbies,
// and handles the process of routing
type World struct {
	Mu       sync.Mutex // To add a new Lobby, need to acquire lock
	LobbyIDs []string
	Lobbies  []Lobby
}

// Creates a new Lobby in the World, and sends a response to
// the Context contains a unique URL representing that Lobby.
// Responds with an error an error if the Context is invalid.
// The URL will be of the form "<host>/lobbies/<id>"
func (w *World) CreateLobby(c *gin.Context) {
	// Generate a unique ID for this lobby
	id := uuid.New().String()

	// Create a new lobby with a unique ID
	lobby, ok := makeLobby(id)
	if ok != nil {
		c.Error(ok)
		return
	}

	// Build URL using ID and hostname
	host := c.Request.Host
	url := fmt.Sprintf("%s/lobbies/%s", host, id)

	// Add Lobby to list of active lobbies
	w.Mu.Lock()
	w.Lobbies = append(w.Lobbies, lobby)
	w.LobbyIDs = append(w.LobbyIDs, id)
	w.Mu.Unlock()

	// Send URL back to requester
	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})
}

// Connects to a Lobby given it's URL. If the URL is valid,
// a websocket will be opened on the Context.
// If the URL is invalid, or if there is an error establishing
// the websocket, an error is returned.
func (w *World) ConnectToLobby(URL string, c *gin.Context) error {
	return nil
}

// Closes down the Lobby with URL, returns an error if no Lobby exists,
// of if the Lobby is already closed.
func (w *World) CloseLobby(URL string) error {
	return nil
}
