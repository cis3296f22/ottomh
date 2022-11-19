package types

type ScoreList struct {
	scorem map[string]int
}

var totalScores = make(map[string]int)

func CreateScores(wm map[string][]string) *ScoreList {

	//Turn Map of words to number of words
	s := new(ScoreList)
	s.scorem = make(map[string]int)
	for key, element := range wm {
		s.scorem[key] = len(element)
	}

	for key := range s.scorem {
		totalScores[key] += s.scorem[key]
	}

	return s
}

func MakeTotalScores(sm map[string]int) map[string]int {

	for key := range sm {
		totalScores[key] += sm[key]
	}

	return totalScores
}
