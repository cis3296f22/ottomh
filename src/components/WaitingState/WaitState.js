import './WaitState.css';
import Button from 'react-bootstrap/Button';

export const WaitState = () => {

    let ws;
    
    if (window.location.protocol == 'https:') {
        ws = new WebSocket(`wss://${window.location.host}/player`);
    } else {
        ws = new WebSocket(`ws://${window.location.host}/player`);
    }

    ws.onopen = (_) => {
        alert("websocket is open now");
    }

    ws.onclose = (_) => {
        alert("websocket is closed now");
    }

    ws.onerror = (error) => {
        alert(`WebSocketd error: ${error.message}`);
        ws.close();
    }

    ws.onmessage = (event) => {
        alert(``);
    }

    return(
        <div class="waitState">
            <h1>OTTOMH</h1>
            <div>
                <h2>Code:</h2>
                <p>"room code"</p>
                <Button variant="primary">Copy URL</Button>
            </div>
            <div>
                <br/>
                <h2>Players joined:</h2>
                <p>"Players"</p>
            </div>
            <Button variant="primary" type="submit">Start</Button>
        </div>
    );
}
