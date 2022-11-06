package main

import (
	"fmt"
	"time"
)

func main() {

	tick := time.Tick(1 * time.Second)
	for countdown := 20; countdown > 0; countdown-- {
		//send to front end
		fmt.Printf("\r%2d", countdown)
		<-tick
	}
	fmt.Println("\rTimer END!")

}
