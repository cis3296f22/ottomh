import './joinStyles.css';
import { useState } from 'react';
import logo from '../../images/logo.svg';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export const Join = ({title}) => {
    let [response, setResponse] = useState("");

    let ws, lobbyUrl;

    async function handleSubmit(e) {
        e.preventDefault();
        let lobbyName = document.getElementById("input-lobby-name").value;
        alert(`Lobby name: ${lobbyName}`);
        let res = await fetch(`http://${window.location.host}/CreateLobby`, {
            method: 'POST',
            body: lobbyName
        });
        if (res.status === 200) {
            let data = await res.json();
            lobbyUrl = data.url;
            alert(`Received from data.url: ${lobbyUrl}`);
            openWebSocket(lobbyUrl);
        }
    }

    function openWebSocket(url) {
        // If the webpage was hosted in a secure context, the wss protocol must be used.
        if (window.location.protocol === 'https:') {
            ws = new WebSocket(`wss://${url}`);
        } else {
            ws = new WebSocket(`ws://${url}`);
        }
        ws.onopen = () => {
            // setFormDisabled(false);
            alert("websocket is open now");
            ws.send(lobbyUrl);
        }
    
        ws.onclose = () => {
            // setFormDisabled(true);
            alert("websocket is closed now");
        }
    
        ws.onerror = (error) => {
            // setFormDisabled(true);
            alert(`WebSocket error: ${error.message}`);
            ws.close();
        }
    
        ws.onmessage = (event) => {
            setResponse(event.data);
            alert(`Message received from server: Lobby name: ${response}`);
        }
    }

    return (
        <main className="join">
            <img src={logo} className="home-logo" alt="logo" />
            <h1>OTTOMH</h1>

            <div className="mb-3 join-form">
                <h2>{title}</h2>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Form.Control
                            id="input-lobby-name"
                            placeholder="Enter lobby name"
                            aria-label="Enter lobby name"
                            aria-describedby="create-new-lobby"
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