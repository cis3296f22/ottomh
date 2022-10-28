import './joinStyles.css';
import logo from '../../images/logo.svg';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate } from 'react-router-dom';

export const Join = ({openLobby}) => {
    let navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        let lobbyId = document.getElementById("input-lobby-code").value;
        alert(`Lobby name: ${lobbyId}`);

        openLobby(lobbyId);
        navigate(`/lobbies/${lobbyId}`);
    }

    return (
        <main className="join">
            <img src={logo} className="join-logo" alt="logo" />
            <h1>OTTOMH</h1>

            <div className="mb-3 join-form">
                <h2>Join a game</h2>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Form.Control
                            id="input-lobby-code"
                            placeholder="Enter lobby code"
                            aria-label="Enter lobby code"
                            aria-describedby="join-game"
                        />
                        <Button variant="primary" id="join-game" type="submit">
                            Join
                        </Button>
                    </InputGroup>
                </Form>
            </div>


            <Button href="/">Back</Button>
        </main>
    );
};