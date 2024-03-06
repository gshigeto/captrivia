package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/ProlificLabs/captrivia/models"
	"github.com/ProlificLabs/captrivia/utils"
	"github.com/gin-gonic/gin"
)

func NewGameServer(questions []models.Question, store *models.SessionStore, multiplayer bool) *models.GameServer {
	uniqueGameID := utils.GenerateRandomID()
	newGameServer := &models.GameServer{
		Questions: questions,
		Sessions:  store,
		ID:        uniqueGameID,
		Multiplayer: multiplayer,
	}

	// If the game is not multiplayer, start it immediately
	if !multiplayer {
		newGameServer.Started = time.Now()
	}

	storeGameServer(newGameServer)
	return newGameServer
}

func GetGameServer(gameID string) (*models.GameServer, error) {
	gameServer, exists := models.GameServers[gameID]
	if !exists {
		return nil, errors.New("game server not found")
	}
	return gameServer, nil
}

func storeGameServer(gameServer *models.GameServer) {
	models.GameServers[gameServer.ID] = gameServer
}

func markGameServerFinished(gameID string) error {
	gameServer, exists := models.GameServers[gameID]
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

	questions := RemoveAnswers(gameServer.Questions)

	response := gin.H{
		"id":       gameServer.ID,
		"started": !gameServer.Started.IsZero(),
		"finished": !gameServer.Finished.IsZero(),
		"multiplayer": gameServer.Multiplayer,
		"questions": questions,
		"questionIndex": session.CurrentQuestion,
		"currentScore": session.Score,
	}

	if gameServer.Owner == sessionID {
		response["owner"] = true
	}

	c.JSON(http.StatusOK, response)
}

func JoinGameHandler(c *gin.Context) {
	var request struct {
		GameID string `json:"gameId"`
		Name string `json:"name"`
	}
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	gameServer, err := GetGameServer(request.GameID)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Do not allow joining a single player game
	if !gameServer.Multiplayer {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot join a single player game"})
		return
	}

	if !gameServer.Finished.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Game has already finished"})
		return
	}

	sessionID := gameServer.Sessions.CreateSession(request.Name)
	PlayerJoinedNotification(request.GameID, request.Name, sessionID)

	c.JSON(http.StatusOK, gin.H{
		"gameId":    gameServer.ID,
		"sessionId": sessionID,
	})
}

func GameWebSocketHandler(c *gin.Context) {
	gameID := c.Param("gameID")

	gameServer, err := GetGameServer(gameID)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	socket, err := utils.UpgradeToWebSocket(c.Writer, c.Request)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	hub := models.GetOrCreateHub()
	client := models.NewClient(gameID, socket, hub)

	hub.Register <- client
	go client.Write()
	go client.Read()

	SendExistingPlayersMessage(client, gameServer)
	SendScoreUpdateMessage(client, gameServer)
}

// Start a new game
func StartGameHandler(c *gin.Context) {
	var request struct {
		Name string `json:"name"`
		Multiplayer bool `json:"multiplayer"`
		Questions int `json:"questions"`
	}
	fmt.Println(request.Multiplayer, request.Name)
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var numberOfQuestions int
	if request.Questions == 0 {
		numberOfQuestions = 10
	} else {
		numberOfQuestions = request.Questions
	}
	questions, err := LoadQuestions(numberOfQuestions)
	if err != nil {
		c.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gameServer := NewGameServer(questions, &models.SessionStore{Sessions: make(map[string]*models.PlayerSession)}, request.Multiplayer)
	sessionID := gameServer.Sessions.CreateSession(request.Name)
	gameServer.Owner = sessionID
	c.JSON(http.StatusOK, gin.H{
		"gameId":    gameServer.ID,
		"sessionId": sessionID,
	})
}

// Get the details of the game server and the session
func getGameEndDetails(gameServer *models.GameServer, session *models.PlayerSession) gin.H {
	if gameServer.Multiplayer {
		sessions := gameServer.Sessions.Sessions
		existingPlayersContent := make([]map[string]string, 0)
		for _, player := range sessions {
			existingPlayerContent := map[string]string{"name": player.Name, "sessionId": player.ID, "score": strconv.Itoa(player.Score)}
			existingPlayersContent = append(existingPlayersContent, existingPlayerContent)
		}
		return gin.H{
			"finalScore": session.Score,
			"multiplayer": gameServer.Multiplayer,
			"finished": !gameServer.Finished.IsZero(),
			"players": existingPlayersContent,
		}
	}
	return gin.H{
		"finalScore": session.Score,
		"multiplayer": gameServer.Multiplayer,
		"finished": !gameServer.Finished.IsZero(),
	}
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
		SendGameFinishedMessage(gameServer)
		c.JSON(http.StatusOK, getGameEndDetails(gameServer, session))
		return
	}

	SendScoreUpdateMessageToAllClients(gameServer)
	c.JSON(http.StatusOK, getGameEndDetails(gameServer, session))
}