package types

import (
	"sync"

	"golang.org/x/exp/slices"
)

// Manages the list of users, and each users submission
type userWordsMap struct {
	Mu sync.RWMutex          // Mutex for userWordsMap.m
	m  (map[string][]string) // Maps username to a list of submissions
}

// Represents an answer submission
type WordPacket struct {
	CurrentPlayer string
	Answer        string
}

// Initializes an empty userWordsMap
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

func (s *userWordsMap) clearAllWords() {
	s.Mu.Lock()
	for k, _ := range s.m {
		s.m[k] = slices.Delete(s.m[k], 0, len(s.m[k]))
	}
	s.Mu.Unlock()

}

func (s *userWordsMap) genWordsArr() []string {
	var wordList []string

	s.Mu.Lock()
	returnedMap := s.m
	for _, value := range returnedMap {
		for _, element := range value {
			wordList = append(wordList, element)
		}
	}
	s.Mu.Unlock()

	return wordList
}

func (s *userWordsMap) removingCrossedWords(cm map[string]int, userPresent int) {
	//we will care if the map value is higher than half the user present in lobby so 10/2 we will need 5 votes to rule an answer out

	slice := make([]string, 20)

	majority := userPresent / 2

	//append words from map that contain >= majority to list
	for key, val := range cm {
		if val >= majority {
			slice = append(slice, key)
		}

	}

	//remove from userwords map
	for _, ele := range slice {
		for key, _ := range s.m {

			idx := slices.Index(s.m[key], ele)
			if idx != -1 {
				s.m[key] = slices.Delete(s.m[key], idx, idx+1)
			}
		}
	}

}

func (v *userWordsMap) UserWords(wordPacket WordPacket) bool {
	var result bool

	username := wordPacket.CurrentPlayer
	answer := wordPacket.Answer

	//result will return False if we find duplicate submission in map
	result = true
	v.Mu.RLock()
	returnedMap := v.m
	for _, element := range returnedMap {
		for i := range element {
			if answer == element[i] {
				result = false
			}
		}
	}
	v.Mu.RUnlock()

	if result {
		//key/val insert in map --> key will hold "user"; val holds  "answer" submitted
		v.mapSetter(username, answer)
	}

	return result
}

func (s *userWordsMap) mapGetter() map[string][]string {
	return s.m
}
