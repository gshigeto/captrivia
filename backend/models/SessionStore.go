package models

import (
	"sync"

	"github.com/ProlificLabs/captrivia/utils"
)
type SessionStore struct {
	sync.Mutex
	Sessions map[string]*PlayerSession
}

func (store *SessionStore) CreateSession(name string) string {
	store.Lock()
	defer store.Unlock()

	uniqueSessionID := utils.GenerateRandomID()
	store.Sessions[uniqueSessionID] = &PlayerSession{ID: uniqueSessionID, Score: 0, Name: name}

	return uniqueSessionID
}

func (store *SessionStore) GetSession(sessionID string) (*PlayerSession, bool) {
	store.Lock()
	defer store.Unlock()

	session, exists := store.Sessions[sessionID]
	return session, exists
}

func (store *SessionStore) DeleteSession(sessionID string) {
	store.Lock()
	defer store.Unlock()

	delete(store.Sessions, sessionID)
}