package types

import (
	"fmt"
)

func scoreCalculator() {
	mapDemo := map[string][]string{
		"user1": []string{"one", "two", "three", "four", "five"},
		"user2": []string{"one", "two", "three", "four", "five"},
		"user3": []string{"one", "two"},
	}

	//Take map of list words and turn into score map
	scorem := make(map[string]int)
	for key, element := range mapDemo {
		scorem[key] = len(element)
	}

	//temporary verification
	for key, element := range scorem {
		fmt.Println("User:", key, "=>", "Score:", element)
	}

}

// send map to front end
func scoreSender() {

}
