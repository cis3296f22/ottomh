package types

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	socketio "github.com/googollee/go-socket.io"
)

// The `World` is a collection of all active lobbies,
// and handles socket.io events.
type World struct {
	Mu      sync.Mutex // To add a new Lobby, need to acquire lock
	Lobbies map[string]Lobby
	Server  *socketio.Server
}

// Initializes a new World with no Lobbies, a Mutex Mu,
// and a Server.
func NewWorld() *World {
	world := &World{Mu: sync.Mutex{}, Lobbies: make(map[string]Lobby)}

	server := socketio.NewServer(nil)

	// Create routes for socket.io
	// Refer to go-socket.io examples here:
	// https://github.com/googollee/go-socket.io/blob/master/_examples/gin-gonic/main.go
	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		log.Println("connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "notice", func(s socketio.Conn, msg string) {
		log.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})

	server.OnEvent("/chat", "msg", func(s socketio.Conn, msg string) string {
		s.SetContext(msg)
		return "recv " + msg
	})

	server.OnEvent("/", "bye", func(s socketio.Conn) string {
		last := s.Context().(string)
		s.Emit("bye", last)
		s.Close()
		return last
	})

	server.OnError("/", func(s socketio.Conn, e error) {
		log.Println("meet error:", e)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println("closed", reason)
	})

	world.Server = server

	return world
}

// Starts Server; it is recommended this function
// is run in a non-blocking go thread

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
	w.Lobbies[id] = lobby
	w.Mu.Unlock()

	// Send URL back to requester
	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})

	log.Print("Created a new Lobby with id: ", id)
}

func (w *World) StartServer() {
	if err := w.Server.Serve(); err != nil {
		log.Fatalf("socketio listen error: %s\n", err)
	}
}

// Registers GET and POST requests to URLS of the form /socket.io/* to Server
func (w *World) RegisterRoutes(r *gin.Engine) {
	r.GET("/socket.io/*any", gin.WrapH(w.Server))
	r.POST("/socket.io/*any", gin.WrapH(w.Server))
}

// Performs clean-up as needed at the end of the app lifetime
func (w *World) Close() {
	w.Server.Close()
}

// Connects to a Lobby given it's URL. If the URL is valid,
// a websocket will be opened on the Context.
// If the URL is invalid, or if there is an error establishing
// the websocket, an error is returned.
func (w *World) ConnectToLobby(c *gin.Context) {
	// Get id from URL
	id := c.Param("id")
	if len(id) == 0 {
		c.Error(errors.New("WebSocket should be of the form '/lobbies/:id'"))
		return
	}

	// Try retrive the Lobby
	lobby, exists := w.Lobbies[id]
	if !exists {
		c.Error(errors.New(fmt.Sprintf("Lobby with id %s does not exist", id)))
		return
	}

	// Try connect the Context to the Lobby
	ok := lobby.acceptWebSocket(c)
	if ok != nil {
		c.Error(ok)
	}

	log.Print("Lobby with id ", id, " has a new client connection.")
}

// Closes down the Lobby with URL, returns an error if no Lobby exists,
// of if the Lobby is already closed.
func (w *World) CloseLobby(URL string) error {
	return nil
}
