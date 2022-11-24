package types

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Adjust the number of concurrent websockets that are tested
const num_users int = 4

type updateUsersPacket struct {
	Event string
	Host  string
	List  []string
}

// A helper function to read messages from a WebSocket and place
// them in a go channel
func readCycle(t *testing.T, ws *websocket.Conn, c chan []byte) {
	for {
		mt, m, err := ws.ReadMessage()
		if err != nil {
			t.Error("Error reading over WebSocket")
		}

		if mt == websocket.TextMessage {
			c <- m
		}
	}
}

func TestLargeGame(t *testing.T) {
	// Each test needs to use a different port; adjust accordingly
	port := "12468"

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

	// We do not differentiate between host and client in storage
	// since all host / client differences are on the frontend.
	wss := make([]*websocket.Conn, num_users)
	ws_chans := make([]chan []byte, num_users)
	for i := 0; i < num_users; i += 1 {
		ws_chans[i] = make(chan []byte, num_users*2)
	}

	t.Run("Test User Connection", func(t *testing.T) {
		expected_host := "user1"

		// Create num_users WebSockets
		for i := 0; i < num_users; i += 1 {
			ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("ws://localhost:%s/sockets/%s?username=user%d&host=%s", port, id, i+1, expected_host), nil)

			if err != nil {
				t.Error("Error creating WebSocket:", nil)
			}

			wss[i] = ws

			// Create a read go thread that just puts messages in the channel
			go readCycle(t, wss[i], ws_chans[i])
		}

		// Ensure that each user has an accurate user list and host
		// Wait for all WebSockets to receive all messages
		for i := 0; i < num_users; i += 1 {
			for len(ws_chans[i]) < num_users-i {
				time.Sleep(time.Millisecond)
			}
		}

		// Initialize our list of expected hosts
		expected_list := make([]string, num_users)
		for i := 0; i < num_users; i += 1 {
			expected_list[i] = fmt.Sprintf("user%d", i+1)
		}
		sort.Strings(expected_list)

		// Get the most up-to-date list from each user, sort it, and
		// compare to the expected user list.
		for i := 0; i < num_users; i += 1 {
			// Read all messages from the channel, keeping the last for ref
			var l []byte = nil
			for {
				select {
				case m := <-ws_chans[i]:
					l = m
				default:
					goto exit_loop
				}
			}

		exit_loop:
			var packet updateUsersPacket
			err := json.Unmarshal(l, &packet)
			if err != nil {
				t.Error("Error unmarshaling 'updateusers' packet:", err)
			}

			// Confirm the underlying data equals the expected data
			if expected_host != packet.Host {
				t.Error("'updateusers' includes unexpected hostname. Expected actual:", expected_host, packet.Host)
			}

			sort.Strings(packet.List)
			if !reflect.DeepEqual(expected_list, packet.List) {
				t.Error("'updateusers' list is not correct. Expected actual:", expected_list, packet.List)
			}
		}
	})
}
