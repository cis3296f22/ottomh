import './scoresStyle.css';
import Button from 'react-bootstrap/Button';

export const Scores = () => {

    return(
        <div class="scores">
            <h2>
                Final Scores
            </h2>
            <div class="scores-box">
                <p>"Player 1+Crown" "score"</p>
                <p>"Player 2" "score"</p>
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