import './gameStyle.css';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { PlayerList } from '../';
import { GamePageTimer } from '../GamePageTimer/GamePageTimer.js';
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useStore } from "../../store";
import { useParams } from "react-router-dom";

export const Game = ({ onTimeover, cat, letter, time_picked, isDupWord }) => {
    const [isLoading, _setLoading] = useState(true);
    const [ws, currentPlayer] = useStore((state) => [state.socket, state.username]);
=======
import { useState, useEffect } from "react";
import { useStore } from "../../store";
import { useParams } from "react-router-dom";

export const Game = ({ onTimeover, cat, letter, time_picked, isUniqueWord }) => {
    const [isLoading, _setLoading] = useState(true);
    const ws = useStore((state) => state.socket);
    const currentPlayer = useStore(state => state.username);
>>>>>>> lobby-frontend
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const { lobbyId } = useParams();

    //responding to word submissions
    const [goodResponse, setGoodResponse] = useState(false)
    const [badResponse, setBadResponse] = useState(false)
    const [word, setWord] = useState("")

    const setLoading = (loading) => {
        // If the timer has ended
        if (!loading) {
            ws.send(JSON.stringify({ Event: 'endround' }));
        }

        _setLoading(loading);
    }

    function handleSubmit(e) {
        e.preventDefault();
<<<<<<< HEAD

        let answer, dataString;

        // get word entered by user from input box
        answer = document.getElementById("input-answer").value;
        document.getElementById("input-answer").value = ''; // reset input box so that users can continue to enter more words
        setWord(answer);

        // prep the data object to be sent over websocket
        // turn the data object into a string
        dataString = JSON.stringify({
            CurrentPlayer: currentPlayer,
            Answer: answer,
            LobbyId: lobbyId
        });

        //send recieved answers along with user and lobbyId to backend for processing 
        ws.send(JSON.stringify({
            Event: "checkword",
            Data: dataString
        }));
    }

    // show modal for good word and bad word based on response from backend
    useEffect(() => {
        if (isDupWord !== null) { // make sure we don't render initial null state
            // console.log(`isDupWord in game: ${isDupWord}`);
            if (isDupWord === true) {
                setGoodResponse(true);
                setTimeout(() => setGoodResponse(false), "700");
            } else {
                setBadResponse(true);
                setTimeout(() => setBadResponse(false), "900");
            }
        }
    }, [isDupWord]);
=======
        let answer = document.getElementById("input-answer").value;
        function letterCheck(word) {
            return word.charAt(0) === letter.toLowerCase();
        }
        //send answer here
        document.getElementById("input-answer").value = '';
        answer = answer.toLowerCase();
        if (letterCheck(answer)) {
            // show this word in the modal
            setWord(answer);

            // prep the data object to be sent over websocket
            // turn the data object into a string
            let dataString = JSON.stringify({
                CurrentPlayer: currentPlayer,
                Answer: answer,
            });

            //send recieved answers with username for backend processing
            ws.send(JSON.stringify({
                Event: "checkword",
                Data: dataString
            }));
        } else {
            handleShow()
        } // end if-else statement


    } // end handleSubmit()

    // show modal for good word and bad word based on response from backend
    useEffect(() => {
        if (isUniqueWord !== null) { // make sure we don't render initial null state
            // console.log(`isUniqueWord in game: ${isUniqueWord}`);
            if (isUniqueWord === true) {
                setGoodResponse(true);
                setTimeout(() => {
                    setGoodResponse(false)
                }, "500");
            } else {
                setBadResponse(true);
                setTimeout(() => {
                    setBadResponse(false)
                }, "500");
            }
        }
    }, [isUniqueWord]);
>>>>>>> lobby-frontend

    if (isLoading) {
        return (
            <div className="game">
                <div>

                    <h2 className="title-h">
                        {cat} <Badge bg="secondary">{letter}</Badge>
                    </h2>
                    <p>Enter as many words starting with letter "{letter}", belonging to Category "{cat}" as possible.</p>

                    <Modal className="instruction-popup" show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title className="reject-title">Answer Rejected: Wrong Letter</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Enter as many words starting with letter "{letter}", belonging to Category "{cat}" as possible.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

<<<<<<< HEAD
                    <h2 className="title-h">
                        {cat} <Badge bg="secondary">{letter}</Badge>
                    </h2>

                    <Modal className="instruction-popup" show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>INFO</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Enter as many words starting with letter "{letter}", belonging to Category "{cat}" as possible.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

=======
>>>>>>> lobby-frontend
                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Form.Control
                                className="input-box"
                                id="input-answer"
                                placeholder="Enter Answer Here"
                                aria-label="Enter Answer"
                                aria-describedby="submit-answer"
<<<<<<< HEAD
=======
                                autoFocus
>>>>>>> lobby-frontend
                            />
                        </InputGroup>
                        <Button className="input-button" variant="primary" id="submit-answer" type="submit">
                            Submit Answer
                        </Button>
                    </Form>
                    <Modal className="answer-good" show={goodResponse} onHide={() => setGoodResponse(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title> Accepted! Good Job! </Modal.Title>
                        </Modal.Header>
                        <Modal.Body> Word submitted: ["{word}"]</Modal.Body>
                    </Modal>
                    <Modal className="answer-bad" show={badResponse} onHide={() => setBadResponse(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title> Rejected! Try Another Answer! </Modal.Title>
                        </Modal.Header>
                        <Modal.Body> Word submitted: ["{word}"]</Modal.Body>
                    </Modal>
                </div>
                <div>
                    <br />
                    <h3>Time Remaining: </h3>


                    <h1>{GamePageTimer(setLoading, time_picked)}</h1>

                    <Button variant="primary" id="directToVote" type="button" onClick={onTimeover} hidden></Button>


                </div>
                <div>
                    <h3>Players:</h3>
                    <PlayerList />
                </div>
            </div>
        );
    }
    else {
        document.getElementById('directToVote').click()
    }

};