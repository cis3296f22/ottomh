package types

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestWebSocket(t *testing.T) {
	// Credit to the following StackOverflow post
	// https://stackoverflow.com/q/65873018
	// For providing a skeleton for testing websockets

	var server_ws *WebSocket
	var client_ws *websocket.Conn
	var backend_err error

	// Create a basic HTTP server to handle test HTTP requests
	s := httptest.NewServer(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			server_ws, backend_err = MakeWebSocket(w, r, r.Header)
		}))
	defer s.Close()

	// URL for attempting to open WebSocket
	u := "ws" + strings.TrimPrefix(s.URL, "http")

	t.Run("Test Faulty WebSocket Initialization", func(t *testing.T) {
		r := httptest.NewRequest("GET", u, strings.NewReader("Hello, Error!"))
		w := httptest.NewRecorder()
		_, err := MakeWebSocket(w, r, r.Header)

		if err == nil {
			t.Error("WebSocket initializer did not return error on faulty request")
		}
	})

	t.Run("Test WebSocket Initialization", func(t *testing.T) {
		var err error
		client_ws, _, err = websocket.DefaultDialer.Dial(u, nil)

		// Make sure client websocket was successfully created
		if err != nil {
			t.Error(err)
		}

		// Make sure server websocket was successfully created
		if backend_err != nil {
			t.Error(backend_err)
		}
	})

	t.Run("Test Ping Implementation", func(t *testing.T) {
		// NOTE: this test does not check that the Ping is actually received.
		// Ping has weird behavior when working with httptest, as in there is
		// no response to Ping on the client side. So, as long as read works,
		// we are going to claim Ping probably works.

		// Ping only sends a message if a certain delay has passed;
		// set the time to make sure the Ping does go off
		server_ws.lastPing = time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC)

		server_ws.Ping()
	})

	t.Run("Test WebSocket Read Implementation", func(t *testing.T) {
		m := []byte("Hello, world!")
		client_ws.WriteMessage(websocket.TextMessage, m)

		// Give the message time to arrive
		time.Sleep(time.Second / 10)

		s_m, err := server_ws.ReadMessage()

		if err != nil {
			t.Error(err)
		}
		if string(s_m) != string(m) {
			t.Error("Client message and server message differ")
		}

		// There should be no messages in transit; make sure that this is handled gracefully
		s_m, err = server_ws.ReadMessage()

		if err == nil {
			t.Error("ReadMessage on empty queue did not return error")
		}
	})

	t.Run("Test WebSocket Write Implementation", func(t *testing.T) {
		m := []byte("Hello, world!")
		server_ws.WriteMessage(m)

		m_t, c_m, err := client_ws.ReadMessage()
		if err != nil {
			t.Error(err)
		}
		if m_t != websocket.TextMessage {
			t.Error("Message encoded with wrong type")
		}
		if string(c_m) != string(m) {
			t.Error("Client message and server message differ")
		}
	})

	t.Run("Test WebSocket With Multiple Readers", func(t *testing.T) {
		wg := sync.WaitGroup{}
		set := sync.Map{}

		// Create ten go threads that will keep reading until they get
		// a non-nil message
		for i := 0; i < 10; i += 1 {
			wg.Add(1)
			go func() {
				defer wg.Done()
				m, err := server_ws.ReadMessage()
				for m == nil {
					if err == ErrClosedWebSocket {
						return
					}
					m, err = server_ws.ReadMessage()
				}
				set.Store(string(m), true)
			}()
		}

		// Send ten messages to the WebSocket
		for i := 0; i < 10; i += 1 {
			m := []byte(fmt.Sprint(i))
			client_ws.WriteMessage(websocket.TextMessage, m)
		}

		// Wait for all go threads to stop
		// If there is a deadlock here, there is an error.
		wg.Wait()

		// Make sure all values are accounted for
		for i := 0; i < 10; i += 1 {
			k := fmt.Sprint(i)
			if _, ok := set.Load(k); !ok {
				t.Error("Sent message not accounted for: ", k)
			}
		}
	})

	t.Run("Closing WebSocket Without Panic", func(t *testing.T) {
		if !server_ws.IsAlive() {
			t.Error("WebSocket closed unexpectedly")
		}

		server_ws.Close()

		if server_ws.IsAlive() {
			t.Error("WebSocket open unexpectedly")
		}

		if _, err := server_ws.ReadMessage(); err != ErrClosedWebSocket {
			t.Error("Read Message is not stopped correctly")
		}
	})
}
