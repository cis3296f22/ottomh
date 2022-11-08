package types

import (
	"io/ioutil"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

type userWordsMap struct {
	Mu sync.RWMutex 
	m (map[string][]string)	

}

func New() *userWordsMap {
	s := new(userWordsMap)
	s.m = make(map[string][]string)
	return s
}

func (s *userWordsMap) mapSetter(someKey string, someValue string) {
	s.Mu.Lock()
	s.m[someKey] = append(s.m[someKey],someValue)
	s.Mu.Unlock()
}


func (v userWordsMap) UserWords(c *gin.Context) {
	x, _ := ioutil.ReadAll(c.Request.Body)
	info := string(x)	//captures body of json post

	//tokenizing information sent from frontend 
	parts := strings.Split(info, ",")
	username := strings.Split(parts[0], ":") 
	entire_answer := strings.Split(parts[1], ":") 
	answer := strings.Split(entire_answer[1], "}") 
	entire_lobbyId := strings.Split(parts[2], ":")
	lobbyId := strings.Split(entire_lobbyId[1], "}")
	lobbyUser := lobbyId[0] +":"+ username[1]

	//result will return False if we find duplicate submission in map
	result := true
	v.Mu.RLock()
	returnedMap := v.m
	for k, element := range returnedMap { 
		id := strings.Split(k, ":")
		for i := range element{
			if (lobbyId[0] == id[0] && answer[0] == element[i]){
				result = false
			}
		}
    }
	v.Mu.RUnlock()

	if (result) {
		//key/val insert in map --> key will hold "lobbyid":"user"; val holds  "answer" submitted 
			v.mapSetter(lobbyUser, answer[0])
		} 	
	
	c.JSON(http.StatusOK, gin.H{
		"Submissions": result,
	})

}
