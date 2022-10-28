import './homeStyles.css';

import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export const Home = () => {
    let lobbyArray, lobbyUrl, lobbyId;
    const navigate = useNavigate();
    const setLobbyId = useStore((state) => state.setLobbyId);

    async function handleNewLobbyClick() {
        let url;

        // send a request to the server to create a new lobby
        if (window.location.protocol === 'https:') {
            url = `https://${window.location.host}/CreateLobby`;
        } else {
            url = `http://${window.location.host}/CreateLobby`;
        }
        let response = await fetch(url, {
            method: 'POST'
        });

        // get the url from the request
        if (response.status === 200) {
            let data = await response.json();
            lobbyUrl = data.url;
        }

        // get the lobbyId from the lobbyUrl
        lobbyArray = lobbyUrl.split('/');
        lobbyId = lobbyArray[lobbyArray.length - 1];

        // set lobbyId 
        setLobbyId(lobbyId);
        navigate(`/lobbies/${lobbyId}`);
    }

    function handleJoinClick() {
        navigate(`/join`);
    }


    return (
        <main className="home">
            <h1>OTTOMH</h1>

            {/* Buttons to create new lobby and join game */}
            <div className="d-grid gap-2">
                <Button variant="primary" type="button" size="lg" onClick={handleNewLobbyClick} className="mb-3">Create new lobby</Button>
                <Button variant="primary" type="button" size="lg" onClick={handleJoinClick}>Join a game</Button>
            </div>
        </main>
    );
};