package utils

import (
	"crypto/rand"
	"fmt"
)

func GenerateRandomID() string {
	randBytes := make([]byte, 16)
	rand.Read(randBytes)
	return fmt.Sprintf("%x", randBytes)
}