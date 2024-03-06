package models

import (
	"time"
)

type PlayerSession struct {
	ID string
	Name string
	Score int
	CurrentQuestion int
	Finished time.Time
}

func (ps *PlayerSession) MarkFinished() {
	ps.Finished = time.Now()
}