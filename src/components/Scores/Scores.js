import './scoresStyle.css';
import Button from 'react-bootstrap/Button';
import { Badge } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import crown from './crown.png';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * This component displays the score page, using the scorelist in the store.
 * @param props
 * @param props.onReplay a callback function when the host replay the game
 * @returns {JSX.Element}
 */
export const Scores = ({ onReplay }) => {
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

    let forwinnerdisplay = [].concat(...sortedScores);

    let rank = 0;

    return (
        <div class="scores">
            <h1 class="scoreheader">
                Scoreboard
            </h1>
            <img class="crown" src={crown} alt="a crown for the winner"></img>
            <div>
                <h3>Winner: {forwinnerdisplay[0]}</h3>
            </div>
            <div className="menu-buttons">
                <Button className='me-2' variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Back to Main
                </Button>
                {hostUser === username ?
                    <Button variant="primary" type="button" onClick={onReplay}>
                        Return to Lobby
                    </Button> : null}
            </div>
            <div className="note mt-4">
                <p>*Scores are calucuted cumulatively</p>
            </div>
            <Table className='mt-2'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Scores</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedScores.map(item => (
                        <tr item={item}>
                            <td>{rank += 1}</td> <td>{item[0]}</td> <td><Badge bg="primary">{item[1]}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </Table>

        </div>
    );
};

Scores.propTypes = {
    /** a callback function when the host replay the game */
    onReplay: PropTypes.func,
}