import './gameStyle.css';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { PlayerList } from '../';

export const Game = () => {

    async function handleSubmit(e) {
        e.preventDefault();
        let answer = document.getElementById("input-answer").value;
        alert(`Answer submitted: ${answer}`);
        //send answer here
    }

    return(
        <div className="game">
            <div>
                <h2>
                    Category <Badge bg="secondary">A</Badge>
                </h2>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Form.Control
                            className="input-box"
                            id="input-answer"
                            placeholder="Enter Answer Here"
                            aria-label="Enter Answer"
                            aria-describedby="submit-answer"
                        />    
                    </InputGroup>
                    <Button className="input-button" variant="primary" id="submit-answer" type="submit">
                            Submit Answer
                    </Button>
                </Form>
            </div>
            <div>
                <br/>
                <h3>Time Remaining: </h3>
                <p>"Timer here"</p>
            </div>
            <div>
                <h3>Players:</h3>
                <PlayerList />
            </div>
        </div>
    );
};