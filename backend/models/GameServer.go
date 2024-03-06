package models

import (
	"errors"
	"time"
)

// Future improvement - store game servers in a database
var GameServers = make(map[string]*GameServer)

type GameServer struct {
	Questions []Question
	Sessions  *SessionStore
	Multiplayer bool
	ID string
	Owner string
	Started time.Time
	Finished time.Time
}

// CheckAnswer checks if the submitted answer is correct and if the question has already been answered
// If the question has already been answered, it returns if the answer was correct and if the question has already been answered
func (gameServer *GameServer) CheckAnswer(sessionID string, questionID string, submittedAnswer int) (bool, bool, error) {
	for _, question := range gameServer.Questions {
		if question.ID == questionID {
			// Determine if the submitted answer is correct
			correct := question.CorrectIndex == submittedAnswer

			// Check if the question has already been answered
			if question.CorrectSession != "" {
				return correct, true, nil
			}

			// Mark the question as answered if the answer is correct
			if correct {
				question.CorrectSession = sessionID
				return correct, false, nil
			}

			// If the answer is incorrect
			return correct, false, nil
		}
	}
	
	// If the question is not found
	return false, false, errors.New("question not found")
}