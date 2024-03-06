package routes

import (
	"github.com/ProlificLabs/captrivia/controllers"
	"github.com/gin-gonic/gin"
)

// GameRoutes defines the routes for the game.
func GameRoutes(router *gin.Engine) {
	router.GET("/game/:gameID/:sessionID", controllers.GetGameHandler)
	router.GET("/game/:gameID/ws", controllers.GameWebSocketHandler)
	router.POST("/game/start", controllers.StartGameHandler)
	router.POST("/game/join", controllers.JoinGameHandler)
	router.POST("/game/end", controllers.EndGameHandler)
}
