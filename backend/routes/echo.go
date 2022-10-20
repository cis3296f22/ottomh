package routes

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// Accepts an HTTP connection, attempts to upgrade to a websocket,
// and starts EchoThread if the upgrade is successful.
// https://github.com/gorilla/websocket/blob/master/examples/echo/server.go used as reference
func EchoHandler(c *gin.Context) {
	// First, "upgrade" the HTTP connection to a WebSocket connection
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Print("Could not upgrade connection: ", err)
		return
	}

	go EchoThread(ws)
}

func EchoThread(ws *websocket.Conn) {
	defer ws.Close()

	for {
		mt, message, err := ws.ReadMessage()
		if err != nil {
			log.Print("Error reading over web socket: ", err)
			return
		}

		log.Print("Echoing message: ", string(message[:]))

		err = ws.WriteMessage(mt, message)
		if err != nil {
			log.Print("Error writing over web socket: ", err)
			return
		}
	}
}
