package types

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/gin-gonic/gin"
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
	r.GET("/sockets:id", lob.ConnectToLobby)

	t.Run("Test Lobby Creation", func(t *testing.T) {
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
		id := comps[len(comps)-1]

		// Ensure that a Lobby with the given id exists
		_, ok := lob.Lobbies[id]
		if !ok {
			t.Error("Lobby not created successfully in the World")
		}
	})
}
