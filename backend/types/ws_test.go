package types

import (
	"net/http"
	"net/http/httptest"
	"strings"
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

	t.Run("Test WebSocket Initialization", func(t *testing.T) {
		u := "ws" + strings.TrimPrefix(s.URL, "http")
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

	// t.Run("Test Ping Implementation", func(t *testing.T) {
	// 	var clientPingReceived, serverPongReceived bool = false, false

	// 	client_ws.SetPingHandler(func(appData string) error {
	// 		clientPingReceived = true
	// 		client_ws.WriteMessage(websocket.PongMessage, []byte("keepalive"))
	// 		return nil
	// 	})

	// 	server_ws.ws.SetPongHandler(func(appData string) error {
	// 		serverPongReceived = true
	// 		return nil
	// 	})

	// 	// Ping only sends a message if a certain delay has passed;
	// 	// set the time to make sure the Ping does go off
	// 	server_ws.lastPing = time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC)

	// 	server_ws.Ping()

	// 	if !clientPingReceived {
	// 		t.Error("Client did not receive ping")
	// 	}

	// 	if !serverPongReceived {
	// 		t.Error("Server did not receive pong")
	// 	}
	// })

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

	t.Run("Closing WebSocket Without Panic", func(t *testing.T) {
		server_ws.Close()
	})
}
