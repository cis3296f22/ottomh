import './waitStateStyle.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store.js';

export const WaitState = ({id, onStart}) => {
    const navigate = useNavigate();
    let ws;
    
    if (window.location.protocol === 'https:') {
        ws = new WebSocket(`wss://${window.location.host}/sockets/${id}`);
    } else {
        ws = new WebSocket(`ws://${window.location.host}/sockets/${id}`);
    }

    ws.onopen = (_) => {
        alert("websocket is open now");
    }

    ws.onclose = (_) => {
        alert("websocket is closed now");
    }

    ws.onerror = (error) => {
        alert(`WebSocketd error: ${error.message}
        No room exists with this code ${id}`);
        navigate("/");
        ws.close();
    }

    ws.onmessage = (event) => {
        alert(``);
    }

    const copyToClipBoard = async copyMe => {
          await navigator.clipboard.writeText(copyMe);
          alert("Code Copied to clipboard");
      };
    

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
                <br/>
                <h2>Players joined:</h2>
                <p>"Players"</p>
            </div>
            <Button variant="primary" type="button" onClick={onStart}>Start</Button>
            <Button variant="primary" type="button" href="/">Refresh to home</Button>
        </div>
    );
}
