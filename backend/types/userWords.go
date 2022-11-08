package types

import (
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
)

type userWordsMap struct {
	m (map[string][]string)	
}

func New() *userWordsMap {
	s := new(userWordsMap)
	s.m = make(map[string][]string)
	return s
}
func (s *userWordsMap) mapSetter(someKey string, someValue string) {
	s.m[someKey] = append(s.m[someKey],someValue)
}


func (s userWordsMap) mapGetter() map[string][]string {
	return s.m
}

func (s userWordsMap) mapKeys() []reflect.Value {
	return reflect.ValueOf(s.m).MapKeys()
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

	//key/val insert in map --> key will hold "lobbyid":"user"; val holds  "answer" submitted 
	v.mapSetter(lobbyUser, answer[0]) 

	
	//List to be sent to frontend
	var arr []string
	returnedMap := v.mapGetter()

	for k, element := range returnedMap { 
		for i := range element{
			to_sent := k
			to_sent += ":"+ element[i]
			arr = append(arr, to_sent)
		}
    }


	c.JSON(http.StatusOK, gin.H{
		"Submissions": arr,
	})
	

	
}
