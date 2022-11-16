package types

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ScoreList struct {
	scorem map[string]int
}

func CreateScores() *ScoreList {
	mapDemo := map[string][]string{
		"user1": {"one", "two", "three", "four", "five"},
		"user2": {"one", "two", "three", "four", "five"},
		"user3": {"one", "two"},
	}
	s := new(ScoreList)
	s.scorem = make(map[string]int)
	for key, element := range mapDemo {
		s.scorem[key] = len(element)
	}
	return s
}

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
