package types

import (
	// "encoding/json"
	// "io/ioutil"
	// "net/http"
	"strings"
	"sync"

	// "github.com/gin-gonic/gin"
	"golang.org/x/exp/slices"
)

type userWordsMap struct {
	Mu sync.RWMutex
	m  (map[string][]string)
}

type WordPacket struct {
	CurrentPlayer string
	Answer        string
	LobbyID       string
}

func New() *userWordsMap {
	s := new(userWordsMap)
	s.m = make(map[string][]string)
	return s
}

func (s *userWordsMap) mapSetter(someKey string, someValue string) {
	s.Mu.Lock()
	s.m[someKey] = append(s.m[someKey], someValue)
	s.Mu.Unlock()
}

func (s *userWordsMap) clearMapLobbyId(lobbyId string) {
	s.Mu.Lock()
	for k, _ := range s.m {
		id := strings.Split(k, ":")
			if lobbyId == id[0] {
				s.m[k] = slices.Delete(s.m[k], 0, len(s.m[k]))
			}
		}
	s.Mu.Unlock()
	
}

func (v *userWordsMap) UserWords(packetIn WordPacket) bool {
	var result bool

	username := packetIn.CurrentPlayer
	answer := packetIn.Answer
	lobbyId := packetIn.LobbyID
	lobbyUser := lobbyId + ":" + username

	//on score page, clear list associated with lobbyId, if username equals delete101x and answer equals delete101x
	if (username == "delete101x" && answer == "delete101x"){
		v.clearMapLobbyId(lobbyId)
	} else {

		//result will return False if we find duplicate submission in map
		result = true
		v.Mu.RLock()
		returnedMap := v.m
		for k, element := range returnedMap {
			id := strings.Split(k, ":")
			for i := range element {
				if lobbyId == id[0] && answer == element[i] {
					result = false
				}
			}
		}
		v.Mu.RUnlock()

		if result {
			//key/val insert in map --> key will hold "lobbyid":"user"; val holds  "answer" submitted
			v.mapSetter(lobbyUser, answer)
		}
	}

	return result
}
