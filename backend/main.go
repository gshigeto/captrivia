package main

import (
	"log"
	"os"

	"github.com/ProlificLabs/captrivia/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Setup the server
	router, err := setupServer()
	if err != nil {
		log.Fatalf("Server setup failed: %v", err)
	}

	// set port to PORT or 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start the server
	log.Println("Server starting on port " + port)
	log.Fatal(router.Run(":" + port))
}

// setupServer configures and returns a new Gin instance with all routes.
// It also returns an error if there is a failure in setting up the server, e.g. loading questions.
func setupServer() (*gin.Engine, error) {
	// Create Gin router and setup routes
	router := gin.Default()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	config := cors.DefaultConfig()
	// allow all origins
	config.AllowAllOrigins = true
	router.Use(cors.New(config))

	routes.GameRoutes(router)
	routes.AnswerRoutes(router)

	return router, nil
}