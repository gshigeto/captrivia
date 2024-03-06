package controllers

import (
	"encoding/json"
	"strconv"

	"github.com/ProlificLabs/captrivia/models"
)

// Sends a message to all clients in the game server to notify them that a player has joined
func PlayerJoinedNotification(gameServerID string, name string, sessionID string) {
	hub := models.GetOrCreateHub()
	// Send a message to the owner of the game to notify them that a new player has joined
	clients := hub.GetAllClients(gameServerID)

	content := map[string]string{"name": name, "sessionId": sessionID}
	contentValue, _ := json.Marshal(content)
	for _, client := range clients {
		client.Send <- models.Message{Type: "playerJoined", Content: string(contentValue)}
	}
}

// Helper function to get the scores of all the players in the game server
func getPlayerScores(gameServer *models.GameServer) string {
	existingPlayers := gameServer.Sessions.Sessions
	existingPlayersContent := make([]map[string]string, 0)
	for _, player := range existingPlayers {
		existingPlayerContent := map[string]string{"name": player.Name, "sessionId": player.ID, "score": strconv.Itoa(player.Score)}
		existingPlayersContent = append(existingPlayersContent, existingPlayerContent)
	}

	existingPlayersContentValue, _ := json.Marshal(existingPlayersContent)
	return string(existingPlayersContentValue)
}

// Send a message to all clients in the game server to notify them that the game has finsihed
func SendGameFinishedMessage(gameServer *models.GameServer) {
	hub := models.GetOrCreateHub()
	clients := hub.GetAllClients(gameServer.ID)

	playerScores := getPlayerScores(gameServer)
	for _, client := range clients {
		client.Send <- models.Message{Type: "gameFinished", Content: playerScores}
	}
}

// Sends a message to the newly created client about the existing players in the game
func SendExistingPlayersMessage(newClient *models.Client, gameServer *models.GameServer) {
	playerScores := getPlayerScores(gameServer)
	newClient.Send <- models.Message{Type: "allPlayers", Content: playerScores}
}

// Sends a message to all clients in the game server to notify them of the current scores
func SendScoreUpdateMessage(newClient *models.Client, gameServer *models.GameServer) {
	playerScores := getPlayerScores(gameServer)
	newClient.Send <- models.Message{Type: "scoreUpdate", Content: playerScores}
}

// Sends a message to all clients in the game server to notify them of the final scores
func SendScoreUpdateMessageToAllClients(gameServer *models.GameServer) {
	hub := models.GetOrCreateHub()
	clients := hub.GetAllClients(gameServer.ID)

	playerScores := getPlayerScores(gameServer)
	for _, client := range clients {
		client.Send <- models.Message{Type: "scoreUpdate", Content: playerScores}
	}
}