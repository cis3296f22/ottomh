/*
	This file launches a Gin web server for serving OTTOMH files.

	To change the port the server is hosted on, set the $PORT environment var.
*/

package main

import (
	"os"

	"github.com/LandenLloyd/OTTOMH/backend/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	r.Static("/static", "frontend/build/static")
	r.StaticFile("/favicon.ico", "frontend/build/favicon.ico")
	r.StaticFile("/robots.txt", "frontend/build/robots.txt")
	r.StaticFile("/manifest.json", "frontend/build/manifest.json")
	r.StaticFile("/logo192.png", "frontend/build/logo192.png")
	r.StaticFile("/logo512.png", "frontend/build/logo512.png")

	r.LoadHTMLFiles("frontend/build/index.html")

	r.GET("/", routes.IndexHandler)
	r.GET("/echo", routes.EchoHandler)

	r.Run(":" + port)
}
