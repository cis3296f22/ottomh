package types

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ScoreList struct {
	scorem map[string]int
	Key    string
	Value  int
}

func CreateScores() *ScoreList {
	mapDemo := map[string][]string{
		"user7": {"one", "two", "three", "four", "five", "six"},
		"user2": {"one", "two", "three", "four", "five"},
		"user1": {"one", "two"},
		"user4": {"one", "two", "three", "four", "five", "six"},
		"user5": {"one", "two", "three", "four", "five", "six", "seven"},
	}
	//Turn Map of words to number of words
	s := new(ScoreList)
	s.scorem = make(map[string]int)
	for key, element := range mapDemo {
		s.scorem[key] = len(element)
	}
	//sort scores by order

	return s
}

// CODES BELOW NOT USING
func (s *ScoreList) ScoreCalculator(c *gin.Context) {
	mapDemo := map[string][]string{
		"user1": {"one", "two", "three", "four", "five"},
		"user2": {"one", "two", "three", "four", "five"},
		"user3": {"one", "two"},
	}

	//Take map of list words and turn into score map
	for key, element := range mapDemo {
		s.scorem[key] = len(element)
	}

	//temporary verification
	for key, element := range s.scorem {
		fmt.Println("User:", key, "=>", "Score:", element)
	}

	// send map to front end
	c.JSON(http.StatusOK, gin.H{
		"Scores": s.scorem,
	})

}
