package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/ProlificLabs/captrivia/models"
	"github.com/ProlificLabs/captrivia/utils"
	"github.com/gin-gonic/gin"
)

// Future improvement - store game servers in a database
var gameServers = make(map[string]*models.GameServer)

func NewGameServer(questions []models.Question, store *models.SessionStore, multiplayer bool) *models.GameServer {
	uniqueGameID := utils.GenerateRandomID()
	newGameServer := &models.GameServer{
		Questions: questions,
		Sessions:  store,
		ID:        uniqueGameID,
		Multiplayer: multiplayer,
	}
	storeGameServer(newGameServer)
	return newGameServer
}

func GetGameServer(gameID string) (*models.GameServer, error) {
	gameServer, exists := gameServers[gameID]
	if !exists {
		return nil, errors.New("game server not found")
	}
	return gameServer, nil
}

func storeGameServer(gameServer *models.GameServer) {
	gameServers[gameServer.ID] = gameServer
}

func markGameServerFinished(gameID string) error {
	gameServer, exists := gameServers[gameID]
	if !exists {
		return errors.New("game server not found")
	}

	gameServer.Finished = time.Now()
	return nil
}

func GetGameHandler(c *gin.Context) {
	gameID := c.Param("gameID")
	sessionID := c.Param("sessionID")

	gameServer, err := GetGameServer(gameID)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	session, exists := gameServer.Sessions.GetSession(sessionID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid session ID"})
		return
	}

	// Remove the correct answers from the questions
	questions := make([]models.Question, len(gameServer.Questions))
	// Copy the questions manually, instead of with copy(), so that we can remove
	// the CorrectIndex property
	for i, q := range gameServer.Questions {
		questions[i] = models.Question{ID: q.ID, QuestionText: q.QuestionText, Options: q.Options}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       gameServer.ID,
		"finished": !gameServer.Finished.IsZero(),
		"multiplayer": gameServer.Multiplayer,
		"questions": questions,
		"questionIndex": session.CurrentQuestion,
		"currentScore": session.Score,
	})
}

func StartGameHandler(c *gin.Context) {
	var request struct {
		Name string `json:"name"`
		Multiplayer bool `json:"multiplayer"`
	}
	fmt.Println(request.Multiplayer, request.Name)
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	questions, err := LoadQuestions(10)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gameServer := NewGameServer(questions, &models.SessionStore{Sessions: make(map[string]*models.PlayerSession)}, request.Multiplayer)
	sessionID := gameServer.Sessions.CreateSession(request.Name, true)
	c.JSON(http.StatusOK, gin.H{
		"gameId":    gameServer.ID,
		"sessionId": sessionID,
	})
}

// Get the details of the game server and the session
func getGameEndDetails(gameServer *models.GameServer, session *models.PlayerSession) gin.H {
	if gameServer.Multiplayer {
		return gin.H{"finalScore": session.Score, "sessionId": gameServer.Sessions}
	}
	return gin.H{"finalScore": session.Score, "finished": !gameServer.Finished.IsZero()}
}

func EndGameHandler(c *gin.Context) {
	var request struct {
		SessionID string `json:"sessionId"`
		GameId string `json:"gameId"`
	}
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	gameServer, err := GetGameServer(request.GameId)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	session, exists := gameServer.Sessions.GetSession(request.SessionID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid session ID"})
		return
	}

	// Check to see if all players have finished
	allFinished := true
	for _, session := range gameServer.Sessions.Sessions {
		if session.Finished.IsZero() {
			allFinished = false
			break
		}
	}

	if allFinished {
		markGameServerFinished(request.GameId)
		c.JSON(http.StatusOK, getGameEndDetails(gameServer, session))
		return
	}

	c.JSON(http.StatusOK, getGameEndDetails(gameServer, session))
}