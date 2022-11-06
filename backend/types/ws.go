package types

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// The WebSocket wrapper provides synchronous read / writes
// to the WebSocket, and a convenient Ping / Pong.
type WebSocket struct {
	ws *websocket.Conn
}

func MakeWebSocket(w http.ResponseWriter, r *http.Request, responseHeader http.Header) (*WebSocket, error) {
	g_ws, err := upgrader.Upgrade(w, r, responseHeader)
	if err != nil {
		return nil, err
	}

	ws := &WebSocket{ws: g_ws}
	return ws, nil
}
