import './Home.css';
import '../../assets/global.css';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/logo.svg';

export const Home = () => {
    return (
        <main className="home center-vertical-layout">
            <img src={logo} className="home-logo" alt="logo" />
            <h1>OTTOMH</h1>

            {/* create new lobby input and button */}
            <Button variant="primary" type="button" href="/new" className="mb-3">Create new lobby</Button>
            <Button variant="primary" type="button" href="/join">Join a game</Button>
        </main>
    );
};