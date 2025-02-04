package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/ProlificLabs/captrivia/models"
	"github.com/gin-gonic/gin"
)

var testRouter *gin.Engine
var testServer *httptest.Server

// TestMain is called before any test runs.
// It allows us to set up things and also clean up after all tests have been run.
func TestMain(m *testing.M) {
	// Set Gin to test mode so that it doesn't print out debug info and we can use testing shortcuts
	gin.SetMode(gin.TestMode)

	var err error
	testRouter, err = setupServer() // This should call the same setupServer which is used in main.
	if err != nil {
		log.Fatal("Failed to set up test server:", err)
	}
	
	// Start a new httptest server using the testRouter.
	testServer = httptest.NewServer(testRouter)

	runTests := m.Run()

	// Close the test server
	testServer.Close()

	// Exit with the result of the test suite run
	os.Exit(runTests)
}

func createGameStartPayload(multiple bool) *bytes.Reader {
	mcPostBody := map[string]interface{}{
		"name": "Billy Bob",
		"multiplayer": multiple,
		"questions": 5,
	}
	body, _ := json.Marshal(mcPostBody)
	return bytes.NewReader(body)
}

func TestStartGameHandler(t *testing.T) {
	resp, err := http.Post(testServer.URL+"/game/start", "application/json", createGameStartPayload(false))
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK; got %v", resp.Status)
	}

	// Decode JSON response
	var response map[string]string
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		t.Fatalf("Failed to decode JSON response: %v", err)
	}

	// Check if a sessionId as been returned
	if _, exists := response["sessionId"]; !exists {
		t.Errorf("Response should contain a sessionId")
	}
}

// test a full game
func TestFullGame(t *testing.T) {
	// Start a new game
	resp, err := http.Post(testServer.URL+"/game/start", "application/json", createGameStartPayload(false))
	if err != nil {
		t.Fatalf("Failed to start a new game: %v", err)
	}
	defer resp.Body.Close()

	// Check for the correct status code
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK; got %v", resp.Status)
	}

	// Decode JSON response to get the session ID
	var startGameResponse map[string]string
	err = json.NewDecoder(resp.Body).Decode(&startGameResponse)
	if err != nil {
		t.Fatalf("Failed to decode JSON response: %v", err)
	}
	gameID, exists := startGameResponse["gameId"]
	if !exists {
		t.Fatalf("Response does not contain 'gameId'")
	}
	sessionID, exists := startGameResponse["sessionId"]
	if !exists {
		t.Fatalf("Response does not contain 'sessionId'")
	}

	// Get questions
	resp, err = http.Get(testServer.URL + "/game/" + gameID + "/" + sessionID)
	if err != nil {
		t.Fatalf("Failed to get questions: %v", err)
	}
	defer resp.Body.Close()

	// Check for the correct status code
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK; got %v", resp.Status)
	}

	// Decode JSON response to get the questions
	var getGameResponse map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&getGameResponse)
	if err != nil {
		t.Fatalf("Failed to decode JSON response: %v", err)
	}

	gameServerQuestions, exists := getGameResponse["questions"]
	if !exists {
		t.Fatalf("Response does not contain 'questions'")
	}

	questionsBytes, err := json.Marshal(gameServerQuestions)
	if err != nil {
		t.Fatalf("Failed to marshal 'questions': %v", err)
	}

	var questions []models.Question
	err = json.NewDecoder(bytes.NewReader(questionsBytes)).Decode(&questions)
	if err != nil {
		t.Fatalf("Failed to decode JSON response: %v", err)
	}
	if len(questions) == 0 {
		t.Fatalf("No questions received")
	}

	// Answer each question (assuming the answer is always the first option)
	for _, question := range questions {
		// Make sure we haven't been given the answer.  We're using the same struct here for the server-side
		// handler and the "client", so if it wasn't set it should always be 0
		if question.CorrectIndex != 0 {
			t.Fatalf("Backend returned answer index")
		}

		answerPayload := fmt.Sprintf(`{"gameId":"%s","sessionId":"%s", "questionId":"%s", "answer":%d}`, gameID, sessionID, question.ID, 0)
		answerReader := strings.NewReader(answerPayload)
		resp, err = http.Post(testServer.URL+"/answer", "application/json", answerReader)
		if err != nil {
			t.Fatalf("Failed to post answer: %v", err)
		}
		defer resp.Body.Close()

		// Check for the correct status code
		if resp.StatusCode != http.StatusOK {
			t.Errorf("Expected status OK; got %v", resp.Status)
		}

		// Decode JSON response to check if the answer was correct
		var answerResponse map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&answerResponse)
		if err != nil {
			t.Fatalf("Failed to decode JSON response: %v", err)
		}
		if _, exists := answerResponse["correct"]; !exists {
			t.Errorf("Response should contain 'correct' field")
		}
	}

	// End the game
	endGamePayload := fmt.Sprintf(`{"gameId":"%s","sessionId":"%s"}`, gameID, sessionID)
	endGameReader := strings.NewReader(endGamePayload)
	resp, err = http.Post(testServer.URL+"/game/end", "application/json", endGameReader)
	if err != nil {
		t.Fatalf("Failed to end the game: %v", err)
	}
	defer resp.Body.Close()

	// Check for the correct status code
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status OK; got %v", resp.Status)
	}

	// Decode JSON response to check the final score
	var endGameResponse map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&endGameResponse)
	if err != nil {
		t.Fatalf("Failed to decode JSON response: %v", err)
	}
	if _, exists := endGameResponse["finalScore"]; !exists {
		t.Errorf("Response should contain 'finalScore' field")
	}
}
