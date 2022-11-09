import './votingStyles.css';
import { Container, Row, ListGroup, Badge } from 'react-bootstrap';
import { GamePageTimer } from '../';
import { useState } from 'react';
import { useStore } from "../../store";

export const Voting = ({ onTimeover, words, cat, letter }) => {
    const ws = useStore((state) => state.socket);

    let onTimerStop = (_) => {
        ws.send(JSON.stringify({ Event: "endvoting" }))
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
            style={{ 'height': '95vh' }}>
            <Row className='h-25 align-content-center'>
                <h1>
                    {cat} <Badge bg="secondary">{letter}</Badge>
                </h1>
                <h2 className='m-0'>Cross off words that don't fit!</h2>
            </Row>
            <Row className='h-50 overflow-auto'>
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