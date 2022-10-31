import './votingStyles.css';
import { Container, Row, ListGroup } from 'react-bootstrap';
import { GamePageTimer } from '../';

export const Voting = ({onTimeover, words}) => {
    let wordList = words.map((word) => 
        <ListGroup.Item key={word}>{word}</ListGroup.Item>);

    return (
        <Container fluid className='m-5 w-auto text-center'
                style={{'height': '95vh'}}>
            <Row className='h-75 overflow-auto'>
                <ListGroup>
                    {wordList}
                </ListGroup>
            </Row>
            <Row className='h-25 align-items-center'>
                {GamePageTimer((_) => onTimeover())}
            </Row>
        </Container>
    );
}