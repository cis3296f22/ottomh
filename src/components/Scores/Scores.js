import './scoresStyle.css';
import Button from 'react-bootstrap/Button';
import { ListGroup, Badge } from 'react-bootstrap';
import crown from './crown.png';
import {useState } from "react";
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';


export const Scores = ({id, onReplay}) => {
    //const ws = useStore((state) => state.socket);
    //ws.send(JSON.stringify({Event: "getscores"}));

    const playerName = useStore((state) => state.username);
    const lobbyId = useStore((state) => state.lobbyId);
    const navigate = useNavigate();
    const scorelist = useStore((state) => state.scorelist);
    const clearStore = useStore((state) => state.clearStore);

    //Turn scorelist into array and sort
    let sortedScores = [];
    for (var username in scorelist) {
        sortedScores.push([username, scorelist[username]]);
    }

    sortedScores.sort(function(a, b) {
        return b[1] - a[1];
    });

    console.log(sortedScores)

    //resetting the userwordsmap when we reach score page 
    let url;
    if (window.location.protocol === 'https:') {
        url = `https://${window.location.host}/GetAnswers`;
    } else {
        url = `http://${window.location.host}/GetAnswers`;
    }
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            CurrentPlayer: "delete101x",
            Answer: "delete101x",
            LobbyId: lobbyId })
    })
    return(
        <div class="scores">
            <h2>
                Final Scores
            </h2>
            <img class="crown" src={crown}></img>
            <div class="winner-box">
                <h3>Winner: {sortedScores[0]}</h3>
            </div>
            <div>
                <Button className='me-2' variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Back to Main
                </Button>
                <Button variant="primary" type="button" onClick={ onReplay }>
                    Replay game
                </Button>
            </div>
            <div class="note">
                <p>*Scores are calucuted cumulatively</p>
            </div>
            <ListGroup className='mt-2'>
                {sortedScores.map(item => (
                    <ListGroup.Item item={item} style={{ fontSize: `2rem` }}>
                        {item[0]} <Badge bg="info">{item[1]}</Badge>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            
        </div>
    );
};