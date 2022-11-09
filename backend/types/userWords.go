package types

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
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

func (v *userWordsMap) UserWords(c *gin.Context) {
	info, _ := ioutil.ReadAll(c.Request.Body) //captures body of json post

	//tokenizing information sent from frontend
	var packetIn WordPacket
	json.Unmarshal(info, &packetIn)

	username := packetIn.CurrentPlayer
	answer := packetIn.Answer
	lobbyId := packetIn.LobbyID
	lobbyUser := lobbyId + ":" + username

	//result will return False if we find duplicate submission in map
	result := true
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

	c.JSON(http.StatusOK, gin.H{
		"Submissions": result,
	})

}
