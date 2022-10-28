import './joinStyles.css';
import { useStore } from '../../store';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export const Join = () => {
    const navigate = useNavigate();
    const inputCodeRef = useRef();
    const inputNameRef = useRef();
    const state = useStore();

    async function handleSubmit(e) {
        e.preventDefault();
        const lobbyId = inputCodeRef.current.value;
        state.setLobbyId(lobbyId);
        state.setUsername(inputNameRef.current.value);
        navigate(`/lobbies/${lobbyId}`);
    }

    return (
        <main className="join">
            <h1>OTTOMH</h1>

            <div className="mb-3 join-form">
                <h2>Join a game</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Control ref={inputCodeRef} className="mb-3" type="text" placeholder="Lobby code" />
                    <Form.Control ref={inputNameRef} className="mb-3" type="text" placeholder="Username" />
                    <div className="d-grid gap-2">
                        <Button variant="primary" size="lg" type="submit">
                            Join game
                        </Button>
                    </div>
                </Form>
            </div>


            <Button href="/">Back</Button>
        </main>
    );
};