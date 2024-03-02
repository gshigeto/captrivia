package models

import (
	"errors"
	"sync"
)

type GameServer struct {
	sync.Mutex
	Questions []Question
	Sessions  *SessionStore
}

func (gameServer *GameServer) StartGame() string {
	gameServer.Lock()
	defer gameServer.Unlock()

	sessionID := gameServer.Sessions.CreateSession()
	return sessionID
}

func (gameServer *GameServer) GetQuestions() []Question {
	gameServer.Lock()
	defer gameServer.Unlock()

	return gameServer.Questions
}

func (gameServer *GameServer) SubmitAnswer(sessionID string, questionID string, answer int) (bool, int, error) {
	gameServer.Lock()
	defer gameServer.Unlock()

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
	gameServer.Lock()
	defer gameServer.Unlock()

	for _, question := range gameServer.Questions {
		if question.ID == questionID {
			return question.CorrectIndex == submittedAnswer, nil
		}
	}
	return false, errors.New("question not found")
}