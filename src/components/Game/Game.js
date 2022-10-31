import './gameStyle.css';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { GamePageTimer } from '../GamePageTimer/GamePageTimer.js';
import {useState } from "react";

export const Game = ({onTimeover}) => {
    const [isLoading, setLoading] = useState(true);

    async function handleSubmit(e) {
        e.preventDefault();
        let answer = document.getElementById("input-answer").value;
        alert(`Answer submitted: ${answer}`);
        //send answer here
    }

    if (isLoading) {
    return(
        <div class="game">
            <div>
                <h2>
                    Category <Badge bg="secondary">A</Badge>
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
                <br/>
                <p>"Players here"</p>
            </div>
        </div>
    );
    }
    else{
           document.getElementById('directToVote').click()
        }

};