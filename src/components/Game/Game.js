import './gameStyle.css';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { PlayerList } from '../';
import { GamePageTimer } from '../GamePageTimer/GamePageTimer.js';
import { useState, useEffect } from "react";
import { useStore } from "../../store";

export const Game = ({ onTimeover, cat, letter, time_picked, isUniqueWord }) => {
    const [isLoading, _setLoading] = useState(true);
    const ws = useStore((state) => state.socket);
    const currentPlayer = useStore(state => state.username);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    //responding to word submissions
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
            if (isUniqueWord !== true) {
                setBadResponse(true);
                setTimeout(() => {
                    setBadResponse(false)
                }, "500");
            }
        }
    }, [isUniqueWord]);

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

                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Form.Control
                                className="input-box"
                                id="input-answer"
                                placeholder="Enter Answer Here"
                                aria-label="Enter Answer"
                                aria-describedby="submit-answer"
                                autoFocus
                            />
                        </InputGroup>
                        <Button className="input-button gameStyle-button" variant="primary" id="submit-answer" type="submit">
                            Submit Answer
                        </Button>
                    </Form>
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