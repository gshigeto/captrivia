package routes

import (
	"github.com/ProlificLabs/captrivia/controllers"
	"github.com/gin-gonic/gin"
)

func QuestionsRoutes(router *gin.Engine) {
	router.GET("/questions", controllers.GetQuestionsHandler)
}