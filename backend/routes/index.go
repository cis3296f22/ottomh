/*
	`routes` declares handler functions for HTTP requests to the Gin server.
*/

package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Serve index.html
func IndexHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", nil)
}
