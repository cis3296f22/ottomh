import './waitStateStyle.css';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export const WaitState = ({ id }) => {
    const navigate = useNavigate();
    const clearStore = useStore((state) => state.clearStore);

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

    return (
        <div className="waitState">
            <h1>OTTOMH</h1>
            <div>
                <h2>Code:</h2>
                {id}
                <br />
                <Button variant="primary">Copy URL</Button>
            </div>
            <div>
                <br />
                <h2>Players joined:</h2>
                <p>"Players"</p>
            </div>
            <div className="d-flex justify-content flex-column align-items-center gap-3">
                <Button className="d-block" variant="primary" type="submit">Start</Button>
                <Button className="d-block" variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Leave Lobby
                </Button>
            </div>
        </div >
    );
}
