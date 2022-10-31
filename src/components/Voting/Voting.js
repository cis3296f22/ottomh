import './votingStyles.css';
import { Container, Row, ListGroup } from 'react-bootstrap';
import { GamePageTimer } from '../';
import { useState } from 'react';

export const Voting = ({onTimeover, words}) => {
    let onTimerStop = (_) => {
        onTimeover();
    }

    // Create an array of boolean that stores whether or not a word is crossed
    let [crossed, setCrossed] = useState(
        Array.from(Array(words.length)).map((_) => false) // Construct array of falses
    );

    let wordList = words.map((word, index) => 
        <ListGroup.Item action 
                onClick={() => setCrossed((crossed) => {
                    let newCrossed = crossed.slice(0);
                    newCrossed[index] = !newCrossed[index];
                    return newCrossed;
                })} 
                key={word + crossed[index]}
                variant={crossed[index] ? 'danger' : ''}>

            {!crossed[index] && word}

            {crossed[index] && <del>{word}</del>}

        </ListGroup.Item>);

    return (
        <Container fluid className='m-5 w-auto text-center'
                style={{'height': '95vh'}}>
            <Row className='h-75 overflow-auto'>
                <ListGroup>
                    {wordList}
                </ListGroup>
            </Row>
            <Row className='h-25 align-items-center'>
                {GamePageTimer(onTimerStop)}
            </Row>
        </Container>
    );
}