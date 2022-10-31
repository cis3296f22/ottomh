import './scoresStyle.css';
import Button from 'react-bootstrap/Button';
import crown from './crown.png';

export const Scores = () => {

    return(
        <div class="scores">
            <h2>
                Final Scores
            </h2>
            <div class="scores-box">
                <p class="gold">"Player 1"<img class="crown" src={crown}/> "score"</p>
                <p class="silver">"Player 2" "score"</p>
            </div>
            <div class="winner-box">
                <h3>Winner: "player"</h3>
            </div>
            <div>
                <h4>Most Voted off: "Player"</h4>
            </div>
        </div>
    );
};