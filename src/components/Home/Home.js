import './homeStyles.css';
import logo from '../../images/logo.svg';

import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

export const Home = ({openLobby}) => {
    let lobbyArray, lobbyUrl, lobbyId;
    let navigate = useNavigate();

    async function handleNewLobbyClick() {
        // send a request to the server to create a new lobby
        let response = await fetch(`http://${window.location.host}/CreateLobby`, {
            method: 'POST'
        });

        // get the url from the request
        if (response.status === 200) {
            let data = await response.json();
            lobbyUrl = data.url;
        }

        // get the lobbyId from the lobbyUrl
        lobbyArray = lobbyUrl.split('/');
        lobbyId = lobbyArray[lobbyArray.length-1];

        // set lobbyId 
        openLobby(lobbyId);
        navigate(`/lobbies/${lobbyId}`);
    }

    function handleJoinClick() {
        navigate(`/lobbies/${lobbyId}`);
    }


    return (
        <main className="home">
            <img src={logo} className="home-logo" alt="logo" />
            <h1>OTTOMH</h1>

            {/* Buttons to create new lobby and join game */}
            <Button variant="primary" type="button" onClick={handleNewLobbyClick} className="mb-3">Create new lobby</Button>
            <Button variant="primary" type="button" onClick={handleJoinClick}>Join a game</Button>
        </main>
    );
};