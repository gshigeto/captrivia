package controllers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/ProlificLabs/captrivia/models"
	"github.com/gin-gonic/gin"
)

func GetQuestionsHandler(c *gin.Context) {
	questions, err := LoadQuestions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	shuffledQuestions := ShuffleQuestions(questions)
	c.JSON(http.StatusOK, shuffledQuestions[:10])
}

func LoadQuestions() ([]models.Question, error) {
	fileBytes, err := os.ReadFile("questions.json")
	if err != nil {
		return nil, err
	}

	var questions []models.Question
	if err := json.Unmarshal(fileBytes, &questions); err != nil {
		return nil, err
	}

	return questions, nil
}

func ShuffleQuestions(questions []models.Question) []models.Question {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	qs := make([]models.Question, len(questions))

	// Copy the questions manually, instead of with copy(), so that we can remove
	// the CorrectIndex property
	for i, q := range questions {
		qs[i] = models.Question{ID: q.ID, QuestionText: q.QuestionText, Options: q.Options}
	}

	rand.Shuffle(len(qs), func(i, j int) {
		qs[i], qs[j] = qs[j], qs[i]
	})
	return qs
}