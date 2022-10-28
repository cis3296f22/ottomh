import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export const Game = () => {

    async function handleSubmit(e) {
        e.preventDefault();
        let answer = document.getElementById("input-answer").value;
        alert(`Answer submitted: ${answer}`);
        //send answer here
    }

    return(
        <div class="Game">
            <div>
                <h2>
                    Category <Badge bg="secondary">A</Badge>
                </h2>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Form.Control
                            id="input-answer"
                            placeholder="Enter Answer Here"
                            aria-label="Enter Answer"
                            aria-describedby="submit-answer"
                        />
                        <Button variant="primary" id="submit-answer" type="submit">
                            Submit Answer
                        </Button>
                    </InputGroup>
                </Form>
            </div>
            <div>
                <br/>
                <h2>Time Remaining: </h2>
                <p>"Timer here"</p>
            </div>
            <div>
                <br/>
                <p>"Players here"</p>
            </div>
        </div>
    );
};