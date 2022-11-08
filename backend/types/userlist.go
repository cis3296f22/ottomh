package types

import (
	"encoding/json"
	"sync"
)

// A WebSocket and its username is very closely related, so we
// store them in a collection together in a transparent manner.
type UserList struct {
	mu      sync.Mutex
	sockets map[string]*WebSocket
	host    string
}

func (ul *UserList) AddSocket(username string, ws *WebSocket) {
	ul.mu.Lock()
	ul.sockets[username] = ws
	ul.mu.Unlock()

	// Inform all sockets a new user has been added
	packetOut, _ := json.Marshal(map[string]interface{}{
		"Event": "updateusers",
		"List":  ul.GetUsernameList(),
		"Host":  ul.GetHost(),
	})
	ul.MessageAll(packetOut)
}

func (ul *UserList) ContainsUser(search string) bool {
	_, exists := ul.sockets[search]
	return exists
}

func (ul *UserList) GetUsernameList() []string {
	unameList := make([]string, 0)
	for username := range ul.sockets {
		unameList = append(unameList, username)
	}
	return unameList
}

func (ul *UserList) SetHost(host string) {
	ul.host = host
}

func (ul *UserList) GetHost() string {
	return ul.host
}

func (ul *UserList) SetInactive(index int) {

}

func (ul *UserList) MessageAll(m []byte) {
	for _, socket := range ul.sockets {
		socket.WriteMessage(m)
	}
}
