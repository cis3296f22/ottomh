/*
	This file launches a Gin web server for serving OTTOMH files.

	To change the port the server is hosted on, set the $PORT environment var.
*/

package main

import (
	"log"
	"os"

	"sync"

	"github.com/cis3296f22/ottomh/backend/routes"
	"github.com/cis3296f22/ottomh/backend/types"
	"github.com/gin-gonic/gin"

	socketio "github.com/googollee/go-socket.io"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	server := socketio.NewServer(nil)

	// Create routes for socket.io
	// Refer to go-socket.io examples here:
	// https://github.com/googollee/go-socket.io/blob/master/_examples/gin-gonic/main.go
	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		log.Println("connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "notice", func(s socketio.Conn, msg string) {
		log.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})

	server.OnEvent("/chat", "msg", func(s socketio.Conn, msg string) string {
		s.SetContext(msg)
		return "recv " + msg
	})

	server.OnEvent("/", "bye", func(s socketio.Conn) string {
		last := s.Context().(string)
		s.Emit("bye", last)
		s.Close()
		return last
	})

	server.OnError("/", func(s socketio.Conn, e error) {
		log.Println("meet error:", e)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println("closed", reason)
	})

	// Start sockets.io server
	go func() {
		if err := server.Serve(); err != nil {
			log.Fatalf("socketio listen error: %s\n", err)
		}
	}()
	defer server.Close()

	r.Static("/static", "build/static")
	r.StaticFile("/favicon.ico", "build/favicon.ico")
	r.StaticFile("/robots.txt", "build/robots.txt")
	r.StaticFile("/manifest.json", "build/manifest.json")
	r.StaticFile("/logo192.png", "build/logo192.png")
	r.StaticFile("/logo512.png", "build/logo512.png")

	r.LoadHTMLFiles("build/index.html")

	lob := types.World{Mu: sync.Mutex{}, Lobbies: make(map[string]types.Lobby)}

	// Catch-all routes four socket.io
	r.GET("/socket.io/*any", gin.WrapH(server))
	r.POST("/socket.io/*any", gin.WrapH(server))

	r.GET("/", routes.IndexHandler)
	r.POST("/CreateLobby", lob.CreateLobby)
	r.GET("/echo", routes.EchoHandler)
	// Catch-all route to work nicely with react-router
	r.GET("/:path", routes.IndexHandler)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("gin.Engine Run error: %s\n", err)
	}
}
