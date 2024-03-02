package routes

import (
	"github.com/ProlificLabs/captrivia/controllers"
	"github.com/gin-gonic/gin"
)

func AnswerRoutes(router *gin.Engine) {
	router.POST("/answer", controllers.AnswerHandler)
}