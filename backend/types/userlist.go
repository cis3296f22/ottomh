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
	mu      sync.Mutex            // mutex for UserList.sockets
	sockets map[string]*WebSocket // maps username to WebSocet
	host    string                // the host in this list of users
}

// Adds a socket `ws` with associated username `username`.
// If `host` is non-empty, update the current host.
// Will then proceed to message all sockets, informing them
// that there has been a new user added.
func (ul *UserList) AddSocket(username string, ws *WebSocket, host string) {
	ul.mu.Lock()
	defer ul.mu.Unlock()
	ul.sockets[username] = ws
	if len(host) != 0 { // If we have been given a new hostname
		ul.host = host
	}

	// Inform all sockets a new user has been added
	packetOut, _ := json.Marshal(map[string]interface{}{
		"Event": "updateusers",
		"List":  ul.getUsernameList(),
		"Host":  ul.host,
	})

	for _, socket := range ul.getSocketList() {
		socket.WriteMessage(packetOut)
	}
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

// Internal: Gets a list of current usernames without blocking
func (ul *UserList) getUsernameList() []string {
	unameList := make([]string, 0)
	for username := range ul.sockets {
		unameList = append(unameList, username)
	}
	return unameList
}

// Internal, non-blocking equivalent of GetSocketList
func (ul *UserList) getSocketList() []*WebSocket {
	socketList := make([]*WebSocket, 0)
	for _, socket := range ul.sockets {
		socketList = append(socketList, socket)
	}
	return socketList
}

// Gets a list of current sockets
func (ul *UserList) GetSocketList() []*WebSocket {
	ul.mu.Lock()
	defer ul.mu.Unlock()
	return ul.getSocketList()
}

// Send the message `m` to all active WebSockets
func (ul *UserList) MessageAll(m []byte) {
	for _, socket := range ul.GetSocketList() {
		socket.WriteMessage(m)
	}
}
