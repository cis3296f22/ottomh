import './scoresStyle.css';
import Button from 'react-bootstrap/Button';
import { Badge } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import crown from './crown.png';
import { useState } from "react";
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';


export const Scores = ({ id, onReplay }) => {

    const playerName = useStore((state) => state.username);
    const lobbyId = useStore((state) => state.lobbyId);
    const navigate = useNavigate();
    const scorelist = useStore((state) => state.scorelist);
    const clearStore = useStore((state) => state.clearStore);
    const [hostUser, username] = useStore(state => [state.hostname, state.username])
    //Turn scorelist into array and sort
    let sortedScores = [];
    for (var un in scorelist) {
        sortedScores.push([un, scorelist[un]]);
    }

    sortedScores.sort(function (a, b) {
        return b[1] - a[1];
    });

    console.log(sortedScores)
    let forwinnerdisplay = [].concat(...sortedScores);

    let rank = 0;

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
            LobbyId: lobbyId
        })
    })
    return (
        <div class="scores">
            <h1 class="scoreheader">
                Scoreboard
            </h1>
            <img class="crown" src={crown} alt="a crown for the winner"></img>
            <div class="winner-box">
                <h3>Winner: {forwinnerdisplay[0]}</h3>
            </div>
            <div>
                <Button className='me-2' variant="secondary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Back to Main
                </Button>
                {hostUser === username ?
                    <Button variant="primary" type="button" onClick={onReplay}>
                        Return to Lobby
                    </Button> : null}
            </div>
            <div class="note">
                <p>*Scores are calucuted cumulatively</p>
            </div>
            <Table className='mt-2'>
                <thead>
                    <tr style={{ fontSize: `2.5rem` }}>
                        <th>#</th>
                        <th>Username</th>
                        <th>Scores</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedScores.map(item => (
                        <tr item={item} style={{ fontSize: `2rem` }}>
                            <td>{rank += 1}</td> <td>{item[0]}</td> <td><Badge bg="primary">{item[1]}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </Table>

        </div>
    );
};