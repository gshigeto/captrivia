package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AnswerHandler(c *gin.Context) {
	var submittedAnswer struct {
		GameID  string `json:"gameId"`
		SessionID  string `json:"sessionId"`
		QuestionID string `json:"questionId"`
		Answer     int    `json:"answer"`
	}
	if err := c.ShouldBindJSON(&submittedAnswer); err != nil {
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	gameServer, err := GetGameServer(submittedAnswer.GameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}

	session, exists := gameServer.Sessions.GetSession(submittedAnswer.SessionID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}
	
	correct, alreadyAnswered, err := gameServer.CheckAnswer(session.ID, submittedAnswer.QuestionID, submittedAnswer.Answer)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	if !alreadyAnswered && correct {
		gameServer.Questions[session.CurrentQuestion].CorrectSession = session.ID
		session.Score += 10 // Increment score for correct answer
	}

	session.CurrentQuestion++ // Increment the current question
	// Check to see if the current question is the last question and mark finished
	if session.CurrentQuestion >= len(gameServer.Questions) {
		session.MarkFinished()
	}

	SendScoreUpdateMessageToAllClients(gameServer)

	c.JSON(http.StatusOK, gin.H{
		"alreadyAnswered": 		alreadyAnswered,
		"correct":      			correct,
		"currentScore":				session.Score, // Return the current score
		"nextQuestionIndex": 	session.CurrentQuestion, // Return the current question
	})
}