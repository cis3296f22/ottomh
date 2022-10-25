import '../../assets/global.css';
import './Join.css';
import {useState} from 'react';
import logo from '../../assets/logo.svg';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export const Join = ({ title }) => {
    let [response, setResponse] = useState("");
    let [formDisabled, setFormDisabled] = useState(true);

    let ws;
    let url = `${window.location.host}/echo`;
    
    // If the webpage was hosted in a secure context, the wss protocol must
    // be used.
    if (window.location.protocol == 'https:') {
        ws = new WebSocket(`wss://${window.location.host}/echo`);
    } else {
        ws = new WebSocket(`ws://${window.location.host}/echo`);
    }

    // Make sure the user can't submit with the form while
    // the websocket is closed.
    ws.onopen = (_) => {
        alert("websocket is open now");
        setFormDisabled(false);
    }

    ws.onclose = (_) => {
        alert("websocket is closed now");
        setFormDisabled(true);
    }

    ws.onerror = (error) => {
        setFormDisabled(true);
        alert(`WebSocketd error: ${error.message}`);
        ws.close();
    }

    ws.onmessage = (event) => {
        setResponse(event.data);
        alert(`message from server: ${response}`);
    }

    ws.onmessage = (event) => {
        alert(`Message received from server: Lobby name: ${event.data}`);
    }

    function submit(e) {
        e.preventDefault();
        let lobbyName = document.getElementById("input-lobby-name").value;
        alert(`
            Lobby name: ${lobbyName}
            ${window.location.host}${window.location.pathname}
        `);
        ws.send(lobbyName);
    }


    return (
        <main className="join center-vertical-layout">
            <img src={logo} className="home-logo" alt="logo" />
            <h1>OTTOMH</h1>

            <div className="mb-3 join-form">
                <h2>{title}</h2>
                <Form onSubmit={submit}>
                    <InputGroup>
                        <Form.Control
                            id="input-lobby-name"
                            placeholder="Enter lobby name"
                            aria-label="Enter lobby name"
                            aria-describedby="create-new-lobby"
                            disabled={formDisabled}
                        />
                        <Button variant="primary" id="create-new-lobby" type="submit">
                            Submit
                        </Button>
                    </InputGroup>
                </Form>
            </div>


            <Button href="/">Back</Button>
        </main>
    );
};