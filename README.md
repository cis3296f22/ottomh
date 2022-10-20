# OTTOMH: A Party-Thinking Game for The Web

## Building

This repo has been tested on MacOS 12.1 with go 1.18.2, node 16.14.2, and NPM 8.5.0.

To run the project:

1. Install NPM packages. `cd` into frontend, and run `npm install`.
2. Bundle JS code. Run `npm run build`.
3. Install Go packages. `cd` into OTTOMH/, and run `go get`.
4. Run the server. Run `go run server.go`.

By default, the server listens on port 8080. If you would like to use another port, set the $PORT environment variable.
