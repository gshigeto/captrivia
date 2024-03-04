package models

import "time"

type PlayerSession struct {
	Name string
	Score int
	CurrentQuestion int
	Finished time.Time
}

func (ps *PlayerSession) UpdateFinishTime() {
	ps.Finished = time.Now()
}