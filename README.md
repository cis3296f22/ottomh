# OTTOMH: A Party-Thinking Game for The Web

FOR social game players WHO are looking for a game to play. THE OTTOMH game is a web-based party trivia game THAT challenges players to come up with as many words that start with a certain letter and belong to a certain category in a set amount of time while competing against other players. 
 
UNLIKE physical board games, OTTOMH is easier to setup and can be played by geographically distributed players. OUR PRODUCT provides a user-friendly, web-based experience similar to the popular board game Scattegories, allowing players to exercise their brains while having a good time. 

## Live Demo
[https://ottomh.herokuapp.com](https://ottomh.herokuapp.com)

## Installing
```bash
git clone https://github.com/cis3296f22/ottomh.git
```

## Using the App

To use the most recent version of the app, please go to https://ottomh.herokuapp.com/.

Currently, you are able to:
1. Host a new game by clicking the "Create new lobby" button

## Building

This repo has been tested on MacOS 12.1 with go 1.18.2, node 16.14.2, and NPM 8.5.0.

To run the project:

1. Install NPM packages with `npm install`.
2. Bundle JS code with `npm run build`.
3. Install Go packages with `go get`.
4. Run the server with `go run server.go`.

By default, the server listens on port 8080. If you would like to use another port, set the $PORT environment variable.

