package models

import (
	"errors"
	"time"
)

type GameServer struct {
	Questions []Question
	Sessions  *SessionStore
	Multiplayer bool
	ID string
	Finished time.Time
}

func (gameServer *GameServer) SubmitAnswer(sessionID string, questionID string, answer int) (bool, int, error) {
	session, exists := gameServer.Sessions.GetSession(sessionID)
	if !exists {
		return false, 0, nil
	}

	correct, err := gameServer.CheckAnswer(questionID, answer)
	if err != nil {
		return false, 0, err
	}

	if correct {
		session.Score += 10
	}

	return correct, session.Score, nil
}

func (gameServer *GameServer) CheckAnswer(questionID string, submittedAnswer int) (bool, error) {
	for _, question := range gameServer.Questions {
		if question.ID == questionID {
			return question.CorrectIndex == submittedAnswer, nil
		}
	}
	return false, errors.New("question not found")
}