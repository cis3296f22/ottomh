import './joinStyles.css';
import { useStore } from '../../store';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';

export const Join = ({ isCreate, onBackClick }) => {
    const navigate = useNavigate();
    const inputCodeRef = useRef(); // get HTML DOM reference to the input box for the lobby code
    const inputNameRef = useRef(); // get HTML DOM reference to the input box for the username
    const [setLobbyId, setUsername] = useStore((state) => (
        [state.setLobbyId, state.setUsername]
    ));

    // when the component loads, immediately focus on the lobby code input box so that user can type immediately
    useEffect(() => {
        inputNameRef.current.focus();
    });

    async function handleSubmit(e) {
        e.preventDefault(); // DO NOT REMOVE OR EVERYTHING WILL BREAK
        let lobbyId;

        // get lobby id either from the server or the input box
        if (isCreate) { // get lobby id from server
            let fetchUrl;

            // send a request to the server to create a new lobby
            if (window.location.protocol === 'https:') {
                fetchUrl = `https://${window.location.host}/CreateLobby`;
            } else {
                fetchUrl = `http://${window.location.host}/CreateLobby`;
            }
            let response = await fetch(fetchUrl, {
                method: 'POST'
            });

            // get the url from the request
            if (response.status === 200) {
                let data = await response.json(); // get json data from server
                let tempArray = data.url.split('/'); // turn the data url into an array of strings
                lobbyId = tempArray[tempArray.length - 1]; // get the lobby id from array
            }
        } else { // get lobby id from input box
            lobbyId = inputCodeRef.current.value;
        }


        // set state and go to waiting room
        setLobbyId(lobbyId);
        setUsername(inputNameRef.current.value);
        navigate(`/lobbies/${lobbyId}`);
    }

    return (
        <>
            <div className="join-form mb-3 p-3 rounded">
                <h2 className="h4 mb-3">
                    {isCreate ? "Create new lobby" : "Join lobby"}
                </h2>
                <Form onSubmit={handleSubmit} className="d-grid gap-3">
                    <Form.Control ref={inputNameRef} type="text" placeholder="Username" />
                    {isCreate === false && <Form.Control ref={inputCodeRef} type="text" placeholder="Lobby code" required />}
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>

            <Button type="button" size="sm" onClick={onBackClick}>
                Back
            </Button>
        </>
    );
};