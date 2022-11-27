# OTTOMH: A Party-Thinking Game for The Web

FOR social game players WHO are looking for a web-based thinking game to play over the internet. THE OTTOMH game is a web-based party trivia game THAT challenges players to come up with as many words that start with a certain letter and belong to a certain category in a set amount of time while competing against other players.  
  
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
2. Join that same game from the home screen using a code
3. Start an open lobby (for one user at a time)
4. Enter answers on the game page
5. Vote off answers on the voting page
6. See final results on scores pages

## Building

This repo has been tested on MacOS 12.1 with go 1.18.2, node 16.14.2, and NPM 8.5.0.

To run the project:

1. Install NPM packages with `npm install`.
2. Bundle JS code with `npm run build`.
3. Install Go packages with `go get`.
4. Run the server with `go run server.go`.

By default, the server listens on port 8080. If you would like to use another port, set the $PORT environment variable.

## Running Tests

[tests.sh](tests.sh) tests the backend with coverage and tests the frontend with coverage using a variety of third-party tools. To run these tests locally you will need to take a few extra steps:
1. Install [go-test-report](https://github.com/vakenbolt/go-test-report) with `go install github.com/vakenbolt/go-test-report@latest`. Make sure to add your GOPATH to the PATH (usually the GOPATH is `~/go/bin`)
2. [Line 3](tests.sh) of tests.sh is configured to open an HTML file in the Brave Browser using Mac's `open` command. You will have to edit this line if you are on a platform other than Mac.
3. The `time_picked` at [src/components/LobbyPage/LobbyPage.js](src/components/LobbyPage/LobbyPage.js) should be set to a very small value, like `"00:3"`.
4. Create the folder `coverage/tmp`.

## Generating Documentation

To generate documentation for the backend, start by installing godoc by running `go install golang.org/x/tools/cmd/godoc@latest`. Then go to the application root, and run `godoc -http=:6060`. You can then visit the go docs at localhost:6060. Here, search for the section labeled "ottomh".

To generate documentation for the frontend, use the jsdoc tool. Use `npm i jsdoc --save-dev` to install jsdoc. To generate documentation for the frontend, use `jsdoc -r src`. Then you can view the documentation by opening `out/index.html`.
