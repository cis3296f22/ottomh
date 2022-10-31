import './votingStyles.css';
import { Container, Row, ListGroup } from 'react-bootstrap';

export const Voting = ({words}) => {
    let wordList = words.map((word) => 
        <ListGroup.Item key={word}>{word}</ListGroup.Item>);

    return (
        <Container fluid className='votingContainer m-5 overflow-auto w-auto'>
            <ListGroup>
                {wordList}
            </ListGroup>
        </Container>
    );
}