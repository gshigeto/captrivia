package models

type Question struct {
	ID           string   `json:"id"`
	QuestionText string   `json:"questionText"`
	Options      []string `json:"options"`
	CorrectIndex int      `json:"correctIndex"`
}

func NewQuestion(id string, questionText string, options []string, correctIndex int) *Question {
	return &Question{
		ID:           id,
		QuestionText: questionText,
		Options:      options,
		CorrectIndex: correctIndex,
	}
}