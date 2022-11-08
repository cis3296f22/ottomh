package types

import "sync"

// A WebSocket and its username is very closely related, so we
// store them in a collection together in a transpartent manner.
type UserList struct {
	userMu sync.Mutex
	users  []*User
	host   string
}

func (ul *UserList) AddSocket(ws *WebSocket) {
	ul.userMu.Lock()
	defer ul.userMu.Unlock()
	user := &User{socket: ws}
	ul.users = append(ul.users, user)
}

func (ul *UserList) GetUsers() []*User {
	ul.userMu.Lock()
	defer ul.userMu.Unlock()
	// Create a copy of the slice for easier sync
	return ul.users[:]
}

func (ul *UserList) GetUsernameList() []string {
	ul.userMu.Lock()
	defer ul.userMu.Unlock()
	unameList := make([]string, len(ul.users))
	for _, user := range ul.users {
		name := user.name
		if len(name) > 0 {
			unameList = append(unameList, name)
		}
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
	users := ul.GetUsers()
	for _, user := range users {
		user.WriteMessage(m)
	}
}

// The User wrapper class, on top of our WebSocket wrapper class (I just love wrapper classes)
// maps each websocket to a username, allowing for users to reconnect.
type User struct {
	mu     sync.Mutex
	socket *WebSocket
	name   string
}

func (u *User) IsAlive() bool {
	return u.socket.IsAlive()
}

func (u *User) ReadMessage() ([]byte, error) {
	return u.socket.ReadMessage()
}

func (u *User) WriteMessage(m []byte) error {
	return u.socket.WriteMessage(m)
}

func (u *User) Ping() {
	u.socket.Ping()
}

func (u *User) UpdateUsername(name string) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.name = name
}
