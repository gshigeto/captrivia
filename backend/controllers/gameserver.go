package controllers

import (
	"errors"
	"net/http"

	"github.com/ProlificLabs/captrivia/models"
	"github.com/gin-gonic/gin"
)

var gameServers = make(map[string]*models.GameServer)

func NewGameServer(questions []models.Question, store *models.SessionStore) *models.GameServer {
	if gameServers == nil {
		gameServers = make(map[string]*models.GameServer)
	}

	newGameServer := &models.GameServer{
		Questions: questions,
		Sessions:  store,
	}
	StoreGameServer("1", newGameServer)
	return newGameServer
}

// func GetGameServer(gameID string) (*models.GameServer, error) {
// TODO: Should return a game server by gameID
func GetGameServer() (*models.GameServer, error) {
	gameID := "1"
	gameServer, exists := gameServers[gameID]
	if !exists {
		return nil, errors.New("game server not found")
	}
	return gameServer, nil
}

func StoreGameServer(gameID string, gameServer *models.GameServer) {
	gameServers[gameID] = gameServer
}

// func DeleteGameServer(gameID string) error {
func DeleteGameServer() error {
	gameID := "1"
	_, exists := gameServers[gameID]
	if !exists {
		return errors.New("game server not found")
	}
	delete(gameServers, gameID)
	return nil
}

func StartGameHandler(c *gin.Context) {
	questions, err := LoadQuestions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gameServer := NewGameServer(questions, &models.SessionStore{Sessions: make(map[string]*models.PlayerSession)})
	sessionID := gameServer.Sessions.CreateSession()
	c.JSON(http.StatusOK, gin.H{"sessionId": sessionID})
}

func EndGameHandler(c *gin.Context) {
	var request struct {
		SessionID string `json:"sessionId"`
	}
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	gameServer, err := GetGameServer()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	session, exists := gameServer.Sessions.GetSession(request.SessionID)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"finalScore": session.Score})
}