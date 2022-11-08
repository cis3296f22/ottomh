import './waitStateStyle.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { PlayerList } from '../';

export const WaitState = ({ id, onStart }) => {
    const navigate = useNavigate();
    const clearStore = useStore((state) => state.clearStore);


    const copyToClipBoard = async copyMe => {
          await navigator.clipboard.writeText(copyMe);
          alert("Code Copied to clipboard");
      };
    
    const [hostUser, username] = useStore(state => [state.hostname, state.username])

    return(
        <div className="waitState">
            <h1>OTTOMH</h1>
            <div>
                <h2>Code:</h2>
                {id}
                <br/>
                <Button onClick={() => copyToClipBoard(id)} variant="primary">Copy Room Code</Button>
            </div>
            <div>
                <br />
                <h2>Players joined:</h2>
                <PlayerList />
            </div>
            <div className="d-flex justify-content flex-column align-items-center gap-3">
            {hostUser === username ?
                <Button className="d-block" variant="primary" type="submit" onClick={onStart}>Start</Button> : null }
                <Button className="d-block" variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Leave Lobby
                </Button>
            </div>
        </div >
    );
}
