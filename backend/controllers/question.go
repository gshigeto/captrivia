package controllers

import (
	"encoding/json"
	"math/rand"
	"os"
	"time"

	"github.com/ProlificLabs/captrivia/models"
)

func LoadQuestions(limit int) ([]models.Question, error) {
	fileBytes, err := os.ReadFile("questions.json")
	if err != nil {
		return nil, err
	}

	var questions []models.Question
	if err := json.Unmarshal(fileBytes, &questions); err != nil {
		return nil, err
	}

	return shuffleQuestions(questions[:limit]), nil
}

func shuffleQuestions(questions []models.Question) []models.Question {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	rand.Shuffle(len(questions), func(i, j int) {
		questions[i], questions[j] = questions[j], questions[i]
	})
	return questions
}

func RemoveAnswers(questions []models.Question) []models.Question {
	qs := make([]models.Question, len(questions))

	// Copy the questions manually, instead of with copy(), so that we can remove
	// the CorrectIndex property
	for i, q := range questions {
		qs[i] = models.Question{ID: q.ID, QuestionText: q.QuestionText, Options: q.Options}
	}

	return qs
}