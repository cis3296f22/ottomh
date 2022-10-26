import Button from 'react-bootstrap/Button';

export const WaitState = () => {
    return (
        <div>
            <h1>OTTOMH</h1>
            <div>
                <h2>Code:</h2>
                <p>"room code"</p>
                <Button variant="primary">Copy URL</Button>
                <br />
            </div>
            <div>
                <h2>Players joined:</h2>
                <p>"Players"</p>
            </div>
            <Button variant="primary" type="submit">Start</Button>
        </div>
    );
};