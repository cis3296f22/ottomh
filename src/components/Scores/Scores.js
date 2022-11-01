import './scoresStyle.css';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import crown from './crown.png';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export const Scores = () => {
    
    const playerName = useStore((state) => state.username);
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    const navigate = useNavigate();
    const clearStore = useStore((state) => state.clearStore);
    return(
        <div class="scores">
            <h2>
                Final Scores
            </h2>
            <div class="scores-box">
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
            </div>
        </div>
    );
};