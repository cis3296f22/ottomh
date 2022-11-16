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

type EventPacket struct {
	Event string
}

// A helper function that reads one message from `socket` and unmarshals
// it into `j`. Will error if there is an issue reading the message, the
// message is not text, or if the message cannot be unmarshaled.
func getTextPacket(socket *websocket.Conn, j any, t *testing.T) {
	mt, m, err := socket.ReadMessage()
	if err != nil {
		t.Error(err)
	}
	if mt != websocket.TextMessage {
		t.Error("Host received non-text message")
	}

	// Interpret message as JSON
	err = json.Unmarshal(m, &j)
	if err != nil {
		t.Error(err)
	}
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
		var j UserListPacket
		getTextPacket(host, &j, t)

		// Test JSON contents against expected results
		if j.Event != "updateusers" {
			t.Error("Unexpected event from the Lobby")
		}
		if j.Host != "testhost" {
			t.Error("Lobby stores incorrect host")
		}
		if !reflect.DeepEqual([]string{"testhost", "testplayer"}, j.List) && !reflect.DeepEqual([]string{"testhost", "testplayer"}, j.List) {
			t.Error("Lobby stores incorrect user list; got", j.List, "but expected", []string{"testhost", "testplayer"})
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
		var j_host StartGamePacket
		getTextPacket(host, &j_host, t)

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
		var j_player StartGamePacket
		getTextPacket(player, &j_player, t)

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

	t.Run("Test Round Ended Event", func(t *testing.T) {
		// Send message as the player
		err := player.WriteMessage(websocket.TextMessage, []byte("{\"Event\":\"endround\"}"))
		if err != nil {
			t.Error(err)
		}

		// Make sure host receives the message
		var j_host EventPacket
		getTextPacket(host, &j_host, t)

		// Verify expected event
		if j_host.Event != "endround" {
			t.Errorf("Host received unexpected event: %s", j_host.Event)
		}

		// Make sure player receives the message
		var j_player EventPacket
		getTextPacket(player, &j_player, t)

		// Verify expected event
		if j_player.Event != "endround" {
			t.Errorf("Host received unexpected event: %s", j_player.Event)
		}
	})

	t.Run("Test Voting Ended Event", func(t *testing.T) {
		// Send message as the player
		err := player.WriteMessage(websocket.TextMessage, []byte("{\"Event\":\"endvoting\"}"))
		if err != nil {
			t.Error(err)
		}

		// Make sure host receives the message
		var j_host EventPacket
		getTextPacket(host, &j_host, t)

		// Verify expected event
		if j_host.Event != "endvoting" {
			t.Errorf("Host received unexpected event: %s", j_host.Event)
		}

		// Make sure player receives the message
		var j_player EventPacket
		getTextPacket(player, &j_player, t)

		// Verify expected event
		if j_player.Event != "endvoting" {
			t.Errorf("Host received unexpected event: %s", j_player.Event)
		}
	})

	t.Run("Handle Unexpected Event With Echo", func(t *testing.T) {
		// Write unexpected event to the world
		m_expected := []byte("{\"Event\":\"boo!\"}")
		err := host.WriteMessage(websocket.TextMessage, m_expected)
		if err != nil {
			t.Error(err)
		}

		// Ensure that host got an echo response
		mt, m, err := host.ReadMessage()
		if mt != websocket.TextMessage {
			t.Error("Host got non-text response")
		}
		if !reflect.DeepEqual(m_expected, m) {
			t.Errorf("Host got non-echo response %s", string(m))
		}
	})
}
