import './gameStyle.css';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
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
    let currentPlayer;
    if (hostPlayer.length > 0){
        currentPlayer = hostPlayer
    } else {
        currentPlayer = player
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        let answer = document.getElementById("input-answer").value;
        // alert(`Answer submitted: ${answer}`);
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
            alert(`Answer submitted and captured: ${answer}`);           
            // console.log("List of stored answers ", all_answers["Submissions"]) //list of all the lobbyid, user name, and answers given 
        }
             
        
    }
    

    ws.onmessage= (e) => {
        alert("message received: " + e.data);
    }
    

    if (isLoading) {
    return(
        <div className="game">
            <div>
                <h2>
                    {cat} <Badge bg="secondary">{letter}</Badge>
                </h2>
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