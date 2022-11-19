package types

import (
	"encoding/json"
	"sync"
)

// A WebSocket and its username is very closely related, so we
// store them in a collection together in a transparent manner.
// If you need to loop over usernames / sockets, get a slice
// using GetUsernameList / GetSocketList; this allows for better
// parallelization.
type UserList struct {
	mu      sync.Mutex
	sockets map[string]*WebSocket
	host    string
}

// Adds a socket `ws` with associated username `username`.
// If `host` is non-empty, update the current host.
// Will then proceed to message all sockets, informing them
// that there has been a new user added.
func (ul *UserList) AddSocket(username string, ws *WebSocket, host string) {
	ul.mu.Lock()
	ul.sockets[username] = ws
	if len(host) != 0 { // If we have been given a new hostname
		ul.host = username
	}
	ul.mu.Unlock()

	// Inform all sockets a new user has been added
	packetOut, _ := json.Marshal(map[string]interface{}{
		"Event": "updateusers",
		"List":  ul.GetUsernameList(),
		"Host":  ul.host,
	})
	ul.MessageAll(packetOut)
}

// Returns true if the UserList already contains an active user with `name`
func (ul *UserList) ContainsUser(name string) bool {
	ul.mu.Lock()
	defer ul.mu.Unlock()
	_, exists := ul.sockets[name]
	if exists == true {
		if !ul.sockets[name].isAlive {
				exists = false
				}
		}
	return exists
}

// Gets a list of current usernames
func (ul *UserList) GetUsernameList() []string {
	ul.mu.Lock()
	defer ul.mu.Unlock()
	unameList := make([]string, 0)
	for username := range ul.sockets {
		unameList = append(unameList, username)
	}
	return unameList
}

// Gets a list of current sockets
func (ul *UserList) GetSocketList() []*WebSocket {
	ul.mu.Lock()
	defer ul.mu.Unlock()
	socketList := make([]*WebSocket, 0)
	for _, socket := range ul.sockets {
		socketList = append(socketList, socket)
	}
	return socketList
}

func (ul *UserList) SetInactive(index int) {

}

func (ul *UserList) MessageAll(m []byte) {
	for _, socket := range ul.GetSocketList() {
		socket.WriteMessage(m)
	}
}
