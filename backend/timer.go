package main

import (
	"fmt"
	"time"
)

func timer(seconds int) {
	tick := time.Tick(1 * time.Second)
	for countdown := seconds; countdown > 0; countdown-- {
		//send to front end
		fmt.Printf("\r%2d", countdown)
		<-tick
	}
	fmt.Println("\rTimer END!")
	//send end signal
}

func main() {
	timer(20)
}
