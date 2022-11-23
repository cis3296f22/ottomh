package types

type ScoreList struct {
	scorem map[string]int
}

func CreateScores(wm map[string][]string) *ScoreList {

	//Turn Map of words to number of words
	s := new(ScoreList)
	s.scorem = make(map[string]int)
	for key, element := range wm {
		s.scorem[key] = len(element)
	}

	return s
}
