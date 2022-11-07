/*
	This file launches a Gin web server for serving OTTOMH files.

	To change the port the server is hosted on, set the $PORT environment var.
*/

package main

import (
	"os"

	"sync"

	"github.com/cis3296f22/ottomh/backend/routes"
	"github.com/cis3296f22/ottomh/backend/types"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	r.Static("/static", "build/static")
	r.StaticFile("/favicon.ico", "build/favicon.ico")
	r.StaticFile("/robots.txt", "build/robots.txt")
	r.StaticFile("/manifest.json", "build/manifest.json")
	r.StaticFile("/logo192.png", "build/logo192.png")
	r.StaticFile("/logo512.png", "build/logo512.png")

	r.LoadHTMLFiles("build/index.html")

	lob := types.World{Mu: sync.Mutex{}, Lobbies: make(map[string]*types.Lobby)}

	r.GET("/", routes.IndexHandler)
	r.POST("/CreateLobby", lob.CreateLobby)
	r.GET("/sockets/:id", lob.ConnectToLobby)
	// Catch-all route to work nicely with react-router
	r.GET("/:path", routes.IndexHandler)

	// DEBUG code: to profile this server:
	// Add the following imports:
	// "log"
	// "net/http"
	// _ "net/http/pprof"
	//
	// Uncomment these lines:
	// go func() {
	// 	log.Println(http.ListenAndServe("localhost:6060", nil))
	// }()
	//
	// And use one of the following:
	// go tool pprof localhost:6060/debug/pprof/heap  # for memory
	// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30  # for cpu

	r.Run(":" + port)
}
