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
const num_users int = 20
const num_submits int = 100

type updateUsersPacket struct {
	Event string
	Host  string
	List  []string
}

type beginGamePacket struct {
	Event    string
	Category string
	Letter   string
}

type checkWordPacket struct {
	Event        string
	Word         string
	IsUniqueWord bool
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
		ws_chans[i] = make(chan []byte, num_submits+1)
	}

	t.Run("Test User Connection", func(t *testing.T) {
		expected_host := "user1"

		// Create num_users WebSockets
		for i := 0; i < num_users; i += 1 {
			go func(index int) {
				ws, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf("ws://localhost:%s/sockets/%s?username=user%d&host=%s", port, id, index+1, expected_host), nil)

				if err != nil {
					t.Error("Error creating WebSocket:", nil)
				}

				wss[index] = ws

				// Create a read go thread that just puts messages in the channel
				go readCycle(t, wss[index], ws_chans[index])
			}(i)
		}

		// Ensure that each user has an accurate user list and host
		// Wait for all WebSockets to receive all messages
		time.Sleep(time.Second / 4)

		// Initialize our list of expected hosts
		expected_list := make([]string, num_users)
		for i := 0; i < num_users; i += 1 {
			expected_list[i] = fmt.Sprintf("user%d", i+1)
		}
		sort.Strings(expected_list)

		// Start by checking that the list contained on the backend is accurate
		backend_list := make([]string, 0)
		for key := range lob.Lobbies[id].userList.sockets {
			backend_list = append(backend_list, key)
		}
		sort.Strings(backend_list)
		if !reflect.DeepEqual(expected_list, backend_list) {
			t.Error("Backend has an inaccurate list of users. Expected actual:", expected_list, backend_list)
		}

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
				t.Error(i+1, "Error unmarshaling 'updateusers' packet:", err)
			}

			// Confirm the underlying data equals the expected data
			if expected_host != packet.Host {
				t.Error(i+1, "'updateusers' includes unexpected hostname. Expected actual:", expected_host, packet.Host)
			}

			sort.Strings(packet.List)
			if !reflect.DeepEqual(expected_list, packet.List) {
				t.Error(i+1, "'updateusers' list is not correct. Expected actual:", expected_list, packet.List)
			}
		}
	})

	t.Run("Test First Game Start", func(t *testing.T) {
		// Signal the backend to start the first game round
		wss[0].WriteMessage(websocket.TextMessage, []byte("{\"Event\":\"begingame\"}"))

		// Ensure that all WebSockets have received a start message
		// and confirm that the categories and letters align
		var cat string = ""
		var letter string = ""
		for i := 0; i < num_users; i += 1 {
			m := <-ws_chans[i]

			var packet beginGamePacket
			err := json.Unmarshal(m, &packet)
			if err != nil {
				t.Error(i+1, "Error unmarshaling 'begingame' package:", err)
			}

			// If this is the first socket we have checked
			if cat == "" {
				if packet.Category == "" || packet.Letter == "" {
					t.Error(i+1, "'begingame' message contains a blank Category and Letter")
				}
				cat = packet.Category
				letter = packet.Letter
			} else {
				if cat != packet.Category {
					t.Error(i+1, "'begingame' messages contain conflicting categories")
				}

				if letter != packet.Letter {
					t.Error(i+1, "'begingame' messages contain conflicting letters")
				}
			}
		}
	})

	t.Run("Test Answer Submission", func(t *testing.T) {
		// To test the answer submission, the general procedure is to have each
		// socket submit a lot of answers. Each WebSocket will keep track of
		// the answers it gets correct / incorrect.
		// We will then compare the records each WebSocket has with the records
		// on the backend.

		// Have each WebSocket submit many answers
		// We select the list of answers each user submits carefully
		// so that there is some overlap, but each user also submits
		// some unique words.
		step_size := num_users
		a_chan := make(chan bool, num_users)
		for i := 0; i < num_users; i += 1 {
			go func(t *testing.T, ws *websocket.Conn, c chan bool, username int, step_size int) {
				for j := username*2 + 1; j < num_submits-1; j += step_size {
					ws.WriteMessage(
						websocket.TextMessage,
						[]byte(fmt.Sprintf(
							`{"Event": "checkword","Data": "{\"CurrentPlayer\":\"user%d\",\"Answer\":\"answer%d\"}"}`,
							username+1, j)))
					ws.WriteMessage(
						websocket.TextMessage,
						[]byte(fmt.Sprintf(
							`{"Event": "checkword","Data": "{\"CurrentPlayer\":\"user%d\",\"Answer\":\"answer%d\"}"}`,
							username+1, j+1)))
					ws.WriteMessage(
						websocket.TextMessage,
						[]byte(fmt.Sprintf(
							`{"Event": "checkword","Data": "{\"CurrentPlayer\":\"user%d\",\"Answer\":\"answer%d\"}"}`,
							username+1, j+2)))
				}
				ws.WriteMessage(
					websocket.TextMessage,
					[]byte(fmt.Sprintf(
						`{"Event": "checkword","Data": "{\"CurrentPlayer\":\"user%d\",\"Answer\":\"answer%d\"}"}`,
						username+1, 100)))
				c <- true
			}(t, wss[i], a_chan, i, step_size)
		}

		// Wait for all WebSockets to finish submitting
		num_users_done := 0
		for range a_chan {
			num_users_done += 1
			if num_users_done == num_users {
				break
			}
		}

		// Give the backend sufficient time to handle the messages
		time.Sleep(time.Second / 4)

		// First, make sure that all answers are in the map
		expected_words := make([]string, 0)
		for i := 0; i < num_submits; i += 1 {
			expected_words = append(expected_words, fmt.Sprintf("answer%d", i+1))
		}
		sort.Strings(expected_words)

		actual_words := lob.Lobbies[id].userWords.genWordsArr()
		sort.Strings(actual_words)
		if !reflect.DeepEqual(expected_words, actual_words) {
			t.Error("The list of words on the backend is incorrect. Expected, actual:", expected_words, actual_words)
		}

		// Next, allow each user to construct their own list of accepted
		// answers, and ensure it agrees with the list on the backend.
		for i := 0; i < num_users; i += 1 {
			// Read all responses, and track those answers that were accepted
			accepted := make([]string, 0)

			for {
				select {
				case m := <-ws_chans[i]:
					var packet checkWordPacket
					err := json.Unmarshal(m, &packet)
					if err != nil {
						t.Error(i+1, "Error unmarshaling 'checkword' packet:", err)
					}

					if packet.IsUniqueWord {
						accepted = append(accepted, packet.Word)
					}
				default:
					goto exit_loop
				}
			}

		exit_loop:
			// Compare the list of accepted words stored locally to those accepted by the backend
			sort.Strings(accepted)
			backend_list := lob.Lobbies[id].userWords.mapGetter()[fmt.Sprintf("user%d", i+1)]
			sort.Strings(backend_list)

			// reflect.DeepEqual does not handle the case of two empty lists
			if !(len(backend_list) == 0 && len(accepted) == 0) && !reflect.DeepEqual(backend_list, accepted) {
				t.Error(i+1, "List of accepted words on backend and frontend differ. Backend frontend:", backend_list, accepted)
			}
		}
	})
}
