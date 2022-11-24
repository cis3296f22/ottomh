import './votingStyles.css';
import { Container, Row, ListGroup, Badge } from 'react-bootstrap';
import { GamePageTimer } from '../';
import { useEffect, useState } from 'react';
import { useStore } from "../../store";
import Button from 'react-bootstrap/Button';


export const Voting = ({ onTimeover, words, cat, letter, time_picked }) => {
    const [isLoading, setLoading] = useState(true);
    const ws = useStore((state) => state.socket);
<<<<<<< HEAD
    const [crossed, setCrossed] = useState(null)
    let wordList;

    const setLoading = (loading) => {
        if (!loading) {
            ws.send(JSON.stringify({ Event: "endvoting" }))
        }
        _setLoading(loading);
    }

=======
    const [myArray, updateMyArray] = useState([]);

    
>>>>>>> lobby-frontend
    // Create an array of boolean that stores whether or not a word is crossed
    useEffect(() => {
        console.log("I made it to voting");
        console.log(`wordsArr: ${words}`);
        if (words !== null) {
            setCrossed(
                Array.from(Array(words.length)).map((_) => false) // Construct array of falses
            );
        }
    }, [words]);

<<<<<<< HEAD
    if (words !== null) {
        wordList = words.map((word, index) =>
            <ListGroup.Item action
                onClick={() => setCrossed((crossed) => {
                    let newCrossed = crossed.slice(0);
                    newCrossed[index] = !newCrossed[index];
                    return newCrossed;
                })}
                key={word + crossed[index]}
                variant={crossed[index] ? 'danger' : ''}>
=======
    let wordList = words.map((word, index) =>
        <ListGroup.Item action
            onClick={() => setCrossed((crossed) => {
                let newCrossed = crossed.slice(0);
                newCrossed[index] = !newCrossed[index];
                if (crossed[index] === false){
                    updateMyArray( arr => [...arr, word]);
                }
                else {
                    updateMyArray(myArray.filter(item => item !== word))
                }
                return newCrossed;
            })}
            key={word + crossed[index]}
            variant={crossed[index] ? 'danger' : ''}>
>>>>>>> lobby-frontend

                {!crossed[index] && word}

                {crossed[index] && <del>{word}</del>}

            </ListGroup.Item>);
    }

    if (isLoading) {
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
                    {GamePageTimer(setLoading, time_picked)}
                    <Button variant="primary" id="directToScore" type="button" onClick={onTimeover} hidden></Button>

                </Row>
            </Container>
        );
    }

<<<<<<< HEAD
    else {
        document.getElementById('directToScore').click()
    }
=======
else { 
    document.getElementById('directToScore').click()
    let crossedWords = myArray.toString(); 
    console.log(crossedWords, "these are the crossedwords");
    ws.send(JSON.stringify({ Event: "endvoting", Data: crossedWords}))
  }
>>>>>>> lobby-frontend

};

