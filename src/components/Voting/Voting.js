import './votingStyles.css';
import { Container, Row, ListGroup, Badge } from 'react-bootstrap';
import { GamePageTimer } from '../';
import { useState } from 'react';
import { useStore } from "../../store";
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

/**
 * This component displays the voting page.
 * @param props
 * @param props.onTimeover callback function when the timer runs out
 * @param props.words a list of words to be voted off
 * @param {string} props.cat the category for this round
 * @param {string} props.letter the letter for this round
 * @param {string} props.time_picked timer duration in format "minutes:seconds"
 * @returns {JSX.Element}
 */
export const Voting = ({ onTimeover, words, cat, letter, time_picked }) => {
    const [isLoading, setLoading] = useState(true);
    const ws = useStore((state) => state.socket);
    
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
if (isLoading) {
    return (
        <Container fluid className='w-100 text-center'
            style={{ 'height': '95vh' }}>
            <Row className='h-25 align-content-center'>
                <h1>
                    {cat} <Badge className="letter">{letter}</Badge>
                </h1>
                <h2 className='m-0'>Cross off <del>words</del> that don't fit!</h2>
            </Row>
            <Row className='h-50 overflow-auto'>
                <ListGroup>
                    {wordList}
                </ListGroup>
            </Row>
            <Row className='h-25 align-items-center'>
                {GamePageTimer(setLoading, time_picked)}
                <Button variant="primary" id ="directToScore" type="button" onClick={onTimeover} hidden></Button>

            </Row>
        </Container>
    );
}

else { 
    document.getElementById('directToScore').click();
    let crossedWords = words.filter((_, index) => crossed[index] === true); 
    ws.send(JSON.stringify({ Event: "endvoting", Data: JSON.stringify(crossedWords)}));
  }

};

Voting.propTypes = {
    /** callback function when the timer runs out */
    onTimeover: PropTypes.func,
    /** a list of words to be voted off */
    words: PropTypes.arrayOf(PropTypes.string),
    /** the category for this round */
    cat: PropTypes.string,
    /** the letter for this round */
    letter: PropTypes.string,
    /** timer duration in format "minutes:seconds" */
    time_picked: PropTypes.string,
}