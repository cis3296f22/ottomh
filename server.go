/*
	This file launches a Gin web server for serving OTTOMH files.

	To change the port the server is hosted on, set the $PORT environment var.
*/

package main

import (
	"log"
	"os"

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

	lob := types.NewWorld()
	// Start sockets.io server
	go lob.StartServer()
	defer lob.Close()

	r.Static("/static", "build/static")
	r.StaticFile("/favicon.ico", "build/favicon.ico")
	r.StaticFile("/robots.txt", "build/robots.txt")
	r.StaticFile("/manifest.json", "build/manifest.json")
	r.StaticFile("/logo192.png", "build/logo192.png")
	r.StaticFile("/logo512.png", "build/logo512.png")

	r.LoadHTMLFiles("build/index.html")

	// Registers routes needed for web sockets
	lob.RegisterRoutes(r)

	r.GET("/", routes.IndexHandler)
	r.POST("/CreateLobby", lob.CreateLobby)
	r.GET("/echo", routes.EchoHandler)
	// Catch-all route to work nicely with react-router
	r.GET("/:path", routes.IndexHandler)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("gin.Engine Run error: %s\n", err)
	}
}
