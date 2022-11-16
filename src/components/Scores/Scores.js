import './scoresStyle.css';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import crown from './crown.png';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export const Scores = ({id, onReplay}) => {
    const ws = useStore((state) => state.socket);
    ws.send(JSON.stringify({Event: "getscores"}));

    const playerName = useStore((state) => state.username);
    const lobbyId = useStore((state) => state.lobbyId);
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    const navigate = useNavigate();
    const scorelist = useStore((state) => state.scorelist);
    const clearStore = useStore((state) => state.clearStore);

    

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
            <div class="scores-box">
                <p>{scorelist}</p>
                <p class="gold">{playerName}<img class="crown" src={crown}/> <Badge>{getRandomInt(10)}</Badge></p>
                <p class="silver">"Player 2" <Badge>0</Badge></p>
            </div>
            <div class="winner-box">
                <h3>Winner: {playerName}</h3>
            </div>
            <div>
                <h4>Most Voted off: "Player 2"</h4>
            </div>
            <div>
                <Button variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Back to Main
                </Button>
                <Button variant="primary" type="button" onClick={ onReplay }>
                    Replay game
                </Button>
            </div>
        </div>
    );
};