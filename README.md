# OTTOMH: A Party-Thinking Game for The Web

## Overview

OTTOMH (off the top of my head) -- pronounced “Otum” -- is a multiplayer web-based party game inspired by Scattergories and The Jackbox Party Pack. A game host can setup a new lobby on our servers that players can join using a link or code sent by the host. In each round of play, players are given a target letter and a category; the goal is to come up with as many items belonging to the category whose name starts with the target letter. The player who can think of the most items “off the top of their head” wins. 

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

