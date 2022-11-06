import './waitStateStyle.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { PlayerList } from '../';

import { io } from 'socket.io-client';

export const WaitState = ({ id, onStart }) => {
    const navigate = useNavigate();
    const clearStore = useStore((state) => state.clearStore);

    let ws;

    if (window.location.protocol === 'https:') {
        ws = io(`wss://${window.location.host}`);
    } else {
        ws = io(`ws://${window.location.host}`);
    }

    ws.on('connect', () => {
        console.log('WebSocket is open now.');
    });

    ws.on('disconnect', () => {
        console.log('WebSocket is closed now.')
    });

    const copyToClipBoard = async copyMe => {
          await navigator.clipboard.writeText(copyMe);
          alert("Code Copied to clipboard");
      };
    
    const isHost = useStore(state => state.hostname)
    let hostUser;
    if (isHost.length > 0){
        hostUser = "admin";
    }
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
            {hostUser === "admin" ?
                <Button className="d-block" variant="primary" type="submit" onClick={onStart}>Start</Button> : null }
                <Button className="d-block" variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Leave Lobby
                </Button>
            </div>
        </div >
    );
}
