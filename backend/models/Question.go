package models

type Question struct {
	ID           		string   `json:"id"`
	QuestionText 		string   `json:"questionText"`
	Options      		[]string `json:"options"`
	CorrectIndex 		int      `json:"correctIndex"`
	CorrectSession 	string      `json:"correctSession"`
}