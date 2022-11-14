package types

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type createLobbyJSON struct {
	Url string
}

func TestWorld(t *testing.T) {
	lob := World{Mu: sync.Mutex{}, Lobbies: make(map[string]*Lobby)}

	// Create a test router
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/CreateLobby", lob.CreateLobby)
	r.GET("/sockets/:id", lob.ConnectToLobby)

	// We use 1 lobby to test various operations
	var id string

	t.Run("Test Lobby Creation", func(t *testing.T) {
		// Use a random seed to force lobby ID collision resolution
		uuid.SetRand(rand.New(rand.NewSource(1000)))

		// Create a fake HTTP request to create a new Lobby
		req, err := http.NewRequest("POST", "/CreateLobby", nil)
		if err != nil {
			t.Error(err)
		}

		// Use a response recorder to inspect output
		w := httptest.NewRecorder()

		// Make the request
		r.ServeHTTP(w, req)

		// Attempt to get url from response
		b := w.Body.Bytes()
		var j createLobbyJSON
		err = json.Unmarshal(b, &j)
		if err != nil {
			t.Error(err)
		}

		// Get ID from URL
		comps := strings.Split(j.Url, "/")
		id = comps[len(comps)-1]

		// Ensure that a Lobby with the given id exists
		_, ok := lob.Lobbies[id]
		if !ok {
			t.Error("Lobby not created successfully in the World")
		}

		// Try create another lobby, using the same random number generator,
		// to test duplicate UUID resolution
		// Use a random seed to force lobby ID collision resolution
		uuid.SetRand(rand.New(rand.NewSource(1000)))

		req, err = http.NewRequest("POST", "/CreateLobby", nil)
		if err != nil {
			t.Error(err)
		}

		// Use a response recorder to inspect output
		w = httptest.NewRecorder()

		// Make the request
		r.ServeHTTP(w, req)

		// Attempt to get url from response
		b = w.Body.Bytes()
		err = json.Unmarshal(b, &j)
		if err != nil {
			t.Error(err)
		}

		// Get ID from URL
		comps = strings.Split(j.Url, "/")
		id = comps[len(comps)-1]

		// Ensure that a Lobby with the given id exists
		_, ok = lob.Lobbies[id]
		if !ok {
			t.Error("Lobby not created successfully in the World")
		}
	})

	t.Run("Test Lobby Join", func(t *testing.T) {
		// Try join lobby without an id
		req, err := http.NewRequest("GET", "/sockets", nil)
		if err != nil {
			t.Error(err)
		}

		w := httptest.NewRecorder()

		r.ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Error("World does not handle URL without id correctly")
		}

		// Try join a lobby that does not exist
		req, err = http.NewRequest("GET", "/sockets/7", nil)
		if err != nil {
			t.Error(err)
		}

		w = httptest.NewRecorder()

		r.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Error("World does not handle non-existent lobby correctly")
		}

		// Try join a lobby without supplying a username
		req, err = http.NewRequest("GET", fmt.Sprintf("/sockets/%s", id), nil)
		if err != nil {
			t.Error(err)
		}

		w = httptest.NewRecorder()

		r.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Error("World does not handle request without username correctly")
		}

		// Try join a Lobby with a malformed WebSocket request
		req, err = http.NewRequest("GET", fmt.Sprintf("/sockets/%s?username=tester", id), nil)
		if err != nil {
			t.Error(err)
		}

		w = httptest.NewRecorder()

		r.ServeHTTP(w, req)
		if w.Code != http.StatusBadRequest {
			t.Error("World does not handle malformed WebSocket request correctly", w.Code)
		}

		// Try join a Lobby with a correct request
		// Creating a WebSocket specifically requires that the Gin Engine actually runs
		go r.Run(":56789")
		_, _, err = websocket.DefaultDialer.Dial(fmt.Sprintf("ws://localhost:56789/sockets/%s?username=tester", id), nil)
		if err != nil {
			t.Error(err)
		}

		// Now, try join again with the same username, and expect an error
		_, _, err = websocket.DefaultDialer.Dial(fmt.Sprintf("ws://localhost:56789/sockets/%s?username=tester", id), nil)
		if err != websocket.ErrBadHandshake {
			t.Error("Error handling duplicate username")
		}
	})

	t.Run("Test Lobby Close", func(t *testing.T) {
		// Close down the lobby originally
		err := lob.CloseLobby(id)
		if err != nil {
			t.Error(err)
		}

		// Make sure subsequent Close calls do not panic
		err = lob.CloseLobby(id)
		if err == nil {
			t.Error("No error when closing lobby second time")
		}

		// Confirm delete actually went through
		_, ok := lob.Lobbies[id]
		if ok {
			t.Error("Lobby was not successfully removed from list of lobbies")
		}
	})
}
