package types

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

	return s
}
