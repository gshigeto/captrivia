package models

import (
	"encoding/json"
	"fmt"
	"strconv"
	"sync"
	"time"
)

// Hub is a struct that holds all the clients and the messages that are sent to them
type Hub struct {
	sync.Mutex
	// Registered clients.
	Clients map[string]map[*Client]bool
	//Unregistered clients.
	Unregister chan *Client
	// Register requests from the clients.
	Register chan *Client
	// Inbound messages from the clients.
	Broadcast chan Message
}

// Message struct to hold message data
type Message struct {
	Type      string  `json:"type"`
	Sender    string  `json:"sender"`
	Recipient string  `json:"recipient"`
	Content   string  `json:"content"`
	ID        string  `json:"id"`
}

var hub *Hub //Singleton hub

func GetOrCreateHub() *Hub {
	if hub == nil {
		hub = NewHub()
		go hub.Run()
	}
	return hub
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[string]map[*Client]bool),
		Unregister: make(chan *Client),
		Register:   make(chan *Client),
		Broadcast:  make(chan Message),
	}
}

//Core function to run the hub
func (h *Hub) Run() {
	for {
		select {
		// Register a client.
		case client := <-h.Register:
			h.RegisterNewClient(client)
			// Unregister a client.
		case client := <-h.Unregister:
			h.RemoveClient(client)
			// Broadcast a message to all clients.
		case message := <-h.Broadcast:
			//Check if the message is a type of "message"
			h.HandleMessage(message)

		}
	}
}

// GetAllClients function to retrieve all clients in the hub for a given client ID
func (h *Hub) GetAllClients(clientID string) []*Client {
	h.Lock()
	defer h.Unlock()
	
	var clients []*Client
	connections := h.Clients[clientID]
	for client := range connections {
		clients = append(clients, client)
	}
	return clients
}

//function check if room exists and if not create it and add client to it
func (h *Hub) RegisterNewClient(client *Client) {
	h.Lock()
	defer h.Unlock()
	
	connections := h.Clients[client.ID]
	if connections == nil {
		connections = make(map[*Client]bool)
		h.Clients[client.ID] = connections
	}
	h.Clients[client.ID][client] = true

	fmt.Println("Size of clients: ", len(h.Clients[client.ID]))
}

//function to remvoe client from room
func (h *Hub) RemoveClient(client *Client) {
	h.Lock()
	defer h.Unlock()
	
	if _, ok := h.Clients[client.ID]; ok {
		delete(h.Clients[client.ID], client)
		close(client.Send)
		fmt.Println("Removed client")
	}
}

func sendCountdownMessage(seconds int) Message {
	content := map[string]string{"secondsLeft": strconv.Itoa(seconds)}
	contentValue, _ := json.Marshal(content)
	 return Message{Type: "startGameCountdown", Content: string(contentValue)}
}

func sendStartGameMessage(clients map[*Client]bool) {
	content := map[string]string{"message": "Game is starting"}
	contentValue, _ := json.Marshal(content)
	message := Message{Type: "startGame", Content: string(contentValue)}

	for client := range clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(clients, client)
		}
	}
}

//function to handle message based on type of message
func (h *Hub) HandleMessage(message Message) {
	h.Lock()
	defer h.Unlock()
	
	//Check if the message is a type of "startGame"
	if message.Type == "startGame" {
		clients := h.Clients[message.ID]
		ticker := time.NewTicker(time.Second)

		iterations := 10
		for range ticker.C {
			for client := range clients {
				select {
				case client.Send <- sendCountdownMessage(iterations):
				default:
					close(client.Send)
					delete(h.Clients[message.ID], client)
				}
			}
			iterations--
			if iterations == -1 {
				ticker.Stop()
				GameServers[message.ID].Started = time.Now()
				sendStartGameMessage(clients)
				break
			}
		}
	}

	//Check if the message is a type of "message"
	if message.Type == "message" {
		clients := h.Clients[message.ID]
		for client := range clients {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.Clients[message.ID], client)
			}
		}
	}

	//Check if the message is a type of "notification"
	if message.Type == "notification" {
		fmt.Println("Notification: ", message.Content)
		clients := h.Clients[message.Recipient]
		for client := range clients {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.Clients[message.Recipient], client)
			}
		}
	}

}