package types

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// The `World` is a collection of all active lobbies,
// and handles the process of routing
type World struct {
	Mu      sync.Mutex // To add a new Lobby, need to acquire lock
	Lobbies map[string]*Lobby
}

// Creates a new Lobby in the World, and sends a response to
// the Context contains a unique URL representing that Lobby.
// Responds with an error an error if the Context is invalid.
// The URL will be of the form "<host>/lobbies/<id>"
func (w *World) CreateLobby(c *gin.Context) {
	// Generate a unique ID for this lobby
	id := uuid.New().String()[:6]

	// Make sure the ID does not already exist
	_, exists := w.Lobbies[id]
	for exists {
		id := uuid.New().String()[:6]
		_, exists = w.Lobbies[id]
	}

	// Create a new lobby with a unique ID
	lobby := makeLobby(id)

	// Build URL using ID and hostname
	host := c.Request.Host
	url := fmt.Sprintf("%s/lobbies/%s", host, id)

	// Add Lobby to list of active lobbies
	w.Mu.Lock()
	w.Lobbies[id] = lobby
	w.Mu.Unlock()

	// Send URL back to requester
	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})

	log.Print("Created a new Lobby with id: ", id)
}

// Connects to a Lobby given it's URL. If the URL is valid,
// a websocket will be opened on the Context.
// If the URL is invalid, or if there is an error establishing
// the websocket, an error is returned.
func (w *World) ConnectToLobby(c *gin.Context) {
	// Get id from URL
	id := c.Param("id")

	// Try retrive the Lobby
	lobby, exists := w.Lobbies[id]
	if !exists {
		c.Error(errors.New(fmt.Sprintf("Lobby with id %s does not exist", id)))
		c.Status(http.StatusBadRequest)
		return
	}

	// Get username from URL and validate
	username := c.Query("username")
	if len(username) == 0 {
		c.Error(errors.New("WebSocket should be of the form '/lobbies/:id?username=bob'"))
		c.Status(http.StatusBadRequest)
		return
	}
	if err := lobby.ValidateUsername(username); err != nil {
		c.Error(err)
		c.Status(http.StatusBadRequest)
		return
	}

	// Is the user the host
	host := c.Query("host")

	// Try connect the Context to the Lobby
	ok := lobby.acceptWebSocket(c, username, host)
	if ok != nil {
		c.Error(ok)
	}

	log.Print("Lobby with id ", id, " has a new client connection.")
}

// Closes down the Lobby with URL, returns an error if no Lobby exists,
// or if the Lobby is already closed.
func (w *World) CloseLobby(id string) error {
	w.Mu.Lock()
	defer w.Mu.Unlock()
	_, ok := w.Lobbies[id]
	if !ok {
		return errors.New("Lobby does not exist")
	}

	delete(w.Lobbies, id)

	return nil
}
