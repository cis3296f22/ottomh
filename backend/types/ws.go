package types

import (
	"errors"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Returned by WebSocket.ReadMessage if there are no messages in the queue
var ErrEmptyQueue error = errors.New("No message in queue")

// Returned by multiple WebSocket methods if the WebSocket is closed
var ErrClosedWebSocket error = errors.New("WebSocket is closed")

// This struct is used to hold data recieved over web sockets
type WSPacket struct {
	Event string
	Data  string
}

// Used by gorilla websockets to open a websocket connection
var upgrader = websocket.Upgrader{}

// Time between pings
var pingDelay = 5 * time.Second

// The WebSocket wrapper provides channel-based messag reading
// from the WebSocket, and a convenient Ping / Pong.
type WebSocket struct {
	ws        *websocket.Conn // The underlying gorilla websocket
	r         chan []byte     // channel containing received messages
	writeLock sync.Mutex      // ensures there is only one writer at a time
	muAlive   sync.Mutex      // mutex on isAlive
	isAlive   bool            // true if the WebSocket is open, false otherwise
	lastPing  time.Time       // time when the last ping was sent out
}

// Sets the WebSocket as inactive and closes
// the underlying websocket connection.
func (ws *WebSocket) Close() {
	ws.muAlive.Lock()
	// Do not close a WebSocket twice
	if !ws.isAlive {
		return
	}
	ws.isAlive = false
	ws.muAlive.Unlock()
	close(ws.r)
	ws.ws.Close()
}

// Each WebSocket maintains one go thread that just reads messages to address
// an issue in the gorilla websockets API: reads are blocking. So, we
// cannot have the Lobby read from each thread as one inactive WebSocket could
// block the whole program.
// Right now, we assume all messages are text.
func (ws *WebSocket) readCycle() {
	for {
		mt, message, err := ws.ws.ReadMessage()
		if err != nil {
			log.Print("Error reading over web socket: ", err)

			// All read errors are permanent and fatal
			ws.Close()

			return
		}

		// Add text messages to the channel
		if mt == websocket.TextMessage {
			ws.r <- message
		}
	}
}

// Try to read a message from the web socket. If no message is available,
// it returns an error. Confirms that the WebSocket is still alive.
func (ws *WebSocket) ReadMessage() ([]byte, error) {
	if ws.IsAlive() {
		select {
		case m := <-ws.r:
			return m, nil
		default:
			return nil, ErrEmptyQueue
		}
	} else {
		return nil, ErrClosedWebSocket
	}
}

// Confirms that the WebSocket is still alive.
// Before using a WebSocket, the user should make sure it is alive.
func (ws *WebSocket) IsAlive() bool {
	// ws.muAlive.Lock()
	// defer ws.muAlive.Unlock()
	return ws.isAlive
}

// Write a message over the web socket.
func (ws *WebSocket) WriteMessage(m []byte) error {
	ws.writeLock.Lock()
	defer ws.writeLock.Unlock()
	err := ws.ws.WriteMessage(websocket.TextMessage, m)
	return err
}

// Send a quick message to the WebSocket to keep it alive.
// The readCycle will detect a missed Pong, and close the socket accordingly.
func (ws *WebSocket) Ping() {
	// We only ping if the time since the last ping is long enough
	now := time.Now()
	if now.Sub(ws.lastPing) >= pingDelay {
		ws.writeLock.Lock()
		defer ws.writeLock.Unlock()
		ws.lastPing = now
		ws.ws.WriteMessage(websocket.PingMessage, []byte("keepalive"))
	}
}

// Constructs a new `WebSocket` instance over the HTTP request represented
// by `w`, `r`, and `responseHeader`.
// Returns the same errors as upgrader.Upgrade
func MakeWebSocket(w http.ResponseWriter, r *http.Request, responseHeader http.Header) (*WebSocket, error) {
	g_ws, err := upgrader.Upgrade(w, r, responseHeader)
	if err != nil {
		return nil, err
	}

	g_ws.SetPongHandler(func(msg string) error {
		return nil
	})

	ws := &WebSocket{
		ws:        g_ws,
		r:         make(chan []byte, 10),
		writeLock: sync.Mutex{},
		muAlive:   sync.Mutex{},
		isAlive:   true,
		lastPing:  time.Now(),
	}

	go ws.readCycle()

	return ws, nil
}
