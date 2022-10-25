import './Home.css';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/logo.svg';

export const Home = () => {
    // let ws;
    // // If the webpage was hosted in a secure context, the wss protocol must
    // // be used.
    // if (window.location.protocol == 'https:') {
    //     ws = new WebSocket(`wss://${window.location.host}/lobby`);
    // } else {
    //     ws = new WebSocket(`ws://${window.location.host}/lobby`);
    // }


    function createNewLobby() {
        alert("you clicked 'create new lobby'");
    }

    function joinGame() {
        alert("you clicked 'join a game'");
    }

    return (
        <main className="home">
            <img src={logo} className="home-logo" alt="logo" />
            <h1>OTTOMH</h1>

            {/* create new lobby input and button */}
            <Button variant="outline-primary" type="button" href="/join">Create new lobby</Button>
            <Button variant="outline-primary" type="button" href="/join">Join a game</Button>
        </main>
    );
};