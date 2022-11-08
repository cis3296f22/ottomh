import './gameStyle.css';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { PlayerList } from '../';
import { GamePageTimer } from '../GamePageTimer/GamePageTimer.js';
import {useState } from "react";
import { useStore } from '../../store';
import { useParams } from "react-router-dom";

export const Game = ({onTimeover, cat, letter, ws}) => {
    const [isLoading, setLoading] = useState(true);
    const hostPlayer = useStore(state => state.hostname)
    const player = useStore(state => state.username)
    const { lobbyId } = useParams();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    let currentPlayer;
    if (hostPlayer.length > 0){
        currentPlayer = hostPlayer
    } else {
        currentPlayer = player
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        let answer = document.getElementById("input-answer").value;
        //send answer here
        document.getElementById("input-answer").value = '';

        //send recieved answers along with user and lobbyId to backend for processing 
        let response = await fetch(`http://${window.location.host}/GetAnswers`, {
            method: "POST",
            body: JSON.stringify({
                currentPlayer: currentPlayer,
                answer: answer,
                lobbyId: lobbyId })
        })
        if (response.status === 200) {
            let all_answers = await response.json();

            if(all_answers["Submissions"] === true) {
                alert(`Accepted; Word submitted: [\"${answer}\"]`);   
            }  else{
                alert(`Rejected: Word ["${answer}"] already given`); 
            }
        }
             
        
    }
    

    ws.onmessage= (e) => {
        alert("message received: " + e.data);
    }
    

    if (isLoading) {
    return(
        <div className="game">
            <div>
                <Button variant="outline-info" onClick={handleShow}>
                    How to Play!
                </Button>

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

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Form.Control
                            className="input-box"
                            id="input-answer"
                            placeholder="Enter Answer Here"
                            aria-label="Enter Answer"
                            aria-describedby="submit-answer"
                        />    
                    </InputGroup>
                    <Button className="input-button" variant="primary" id="submit-answer" type="submit">
                            Submit Answer
                    </Button>
                </Form>
            </div>
            <div>
                <br/>
                <h3>Time Remaining: </h3>
               
               
                    <h1>{GamePageTimer(setLoading)}</h1>
        
                <Button variant="primary" id ="directToVote" type="button" onClick={onTimeover} hidden></Button>


            </div>
            <div>
                <h3>Players:</h3>
                <PlayerList />
            </div>
        </div>
    );
    }
    else{
           document.getElementById('directToVote').click()
        }

};