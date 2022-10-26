import './homeStyles.css';
import Button from 'react-bootstrap/Button';
import logo from '../../images/logo.svg';

export const Home = () => {
    return (
        <main className="home">
            <img src={logo} className="home-logo" alt="logo" />
            <h1>OTTOMH</h1>

            {/* create new lobby input and button */}
            <Button variant="primary" type="button" href="/new" className="mb-3">Create new lobby</Button>
            <Button variant="primary" type="button" href="/join">Join a game</Button>
        </main>
    );
};