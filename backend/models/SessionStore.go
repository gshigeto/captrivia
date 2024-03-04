package models

import (
	"sync"

	"github.com/ProlificLabs/captrivia/utils"
)
type SessionStore struct {
	sync.Mutex
	Owner string
	Sessions map[string]*PlayerSession
}

func (store *SessionStore) CreateSession(name string, owner bool) string {
	store.Lock()
	defer store.Unlock()

	uniqueSessionID := utils.GenerateRandomID()
	store.Owner = uniqueSessionID
	store.Sessions[uniqueSessionID] = &PlayerSession{Score: 0, Name: name}

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