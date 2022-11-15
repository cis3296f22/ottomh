package types

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"sync"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type UserListPacket struct {
	Event string
	List  []string
	Host  string
}

type StartGamePacket struct {
	Event    string
	Category string
	Letter   string
}

func TestTwoPlayerGame(t *testing.T) {
	// Each test needs to use a different port; adjust accordingly
	port := "12345"

	lob := World{Mu: sync.Mutex{}, Lobbies: make(map[string]*Lobby)}

	// Create a test router
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/CreateLobby", lob.CreateLobby)
	r.GET("/sockets/:id", lob.ConnectToLobby)
	go r.Run(fmt.Sprintf(":%s", port))

	var id string

	t.Run("Test Lobby Creation", func(t *testing.T) {
		// Create an HTTP request to create a new Lobby
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
	})

	var host *websocket.Conn
	t.Run("Test Host Connection", func(t *testing.T) {
		// Ensure that host can be connected successfully
		var err error
		host, _, err = websocket.DefaultDialer.Dial(
			fmt.Sprintf("ws://localhost:%s/sockets/%s?username=testhost&host=testhost", port, id), nil)
		if err != nil {
			t.Error(err)
		}
	})

	var player *websocket.Conn
	t.Run("Test Player Connection", func(t *testing.T) {
		// Ensure that the player can be connected successfully
		var err error
		player, _, err = websocket.DefaultDialer.Dial(
			fmt.Sprintf("ws://localhost:%s/sockets/%s?username=testplayer&host=", port, id), nil)
		if err != nil {
			t.Error(err)
		}

		// The host should have received a message telling them a new player joined
		// If timeout, no message was received so an error occurred.
		host.ReadMessage() // First message tells the host itself joined
		mt, m, err := host.ReadMessage()
		if err != nil {
			t.Error(err)
		}
		if mt != websocket.TextMessage {
			t.Error("Host received non-text message")
		}

		// Interpret message as JSON
		var j UserListPacket
		err = json.Unmarshal(m, &j)
		if err != nil {
			t.Error(err)
		}

		// Test JSON contents against expected results
		if j.Event != "updateusers" {
			t.Error("Unexpected event from the Lobby")
		}
		if j.Host != "testhost" {
			t.Error("Lobby stores incorrect host")
		}
		if !reflect.DeepEqual([]string{"testhost", "testplayer"}, j.List) {
			t.Error("Lobby stores incorrect user list")
		}

		// Ignore player self-connection message
		player.ReadMessage()
	})

	t.Run("Test Game Start", func(t *testing.T) {
		// Ensure start message successfully sends to the backend
		err := host.WriteMessage(websocket.TextMessage, []byte("{\"Event\": \"begingame\"}"))
		if err != nil {
			t.Error(err)
		}

		// Ensure both host and player receive a "begingame" event
		// Start by reading from host
		mt, m, err := host.ReadMessage()
		if err != nil {
			t.Error(err)
		}
		if mt != websocket.TextMessage {
			t.Error(err)
		}

		// Attempt to interpret host's message as JSON
		// Interpret message as JSON
		var j_host StartGamePacket
		err = json.Unmarshal(m, &j_host)
		if err != nil {
			t.Error(err)
		}

		// Check expected values
		if j_host.Event != "begingame" {
			t.Error("Host received unexpected event")
		}
		if len(j_host.Category) == 0 {
			t.Error("Host did not receive Category")
		}
		if len(j_host.Letter) == 0 {
			t.Error("Host did not receive Letter")
		}

		// Next, read from the player
		mt, m, err = player.ReadMessage()
		if err != nil {
			t.Error(err)
		}
		if mt != websocket.TextMessage {
			t.Error(err)
		}

		// Attempt to interpret host's message as JSON
		// Interpret message as JSON
		var j_player StartGamePacket
		err = json.Unmarshal(m, &j_player)
		if err != nil {
			t.Error(err)
		}

		// Check expected values
		if j_player.Event != "begingame" {
			t.Error("Player received unexpected event")
		}
		if j_player.Category != j_host.Category {
			t.Error("Player did not receive Category")
		}
		if j_player.Letter != j_host.Letter {
			t.Error("Player did not receive Letter")
		}
	})
}
