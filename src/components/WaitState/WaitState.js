import './waitStateStyle.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { useState } from 'react';
import { PlayerList } from '../';
import logo from '../../images/logo.png';
import PropTypes from 'prop-types';

/**
 * This component displays the waiting page.
 * @param props
 * @param {string} props.id the id for this lobby
 * @param props.onStart a callback function called when the host presses start;
 * this button is visible only to the host. 
 * @returns {JSX.Element}
 */
export const WaitState = ({ id, onStart }) => {
    const navigate = useNavigate();
    const clearStore = useStore((state) => state.clearStore);
    const [isShow, setIsShow] = useState(false);


    const copyToClipBoard = async copyMe => {
        setIsShow(true);
        await navigator.clipboard.writeText(copyMe);
        setTimeout(() => {
            setIsShow(false);
        }, "700");
    };

    const [hostUser, username] = useStore(state => [state.hostname, state.username])

    return (
        <div className="waitState">
            <Modal className="copy-modal" show={isShow}>
                <Modal.Body>Copied to clipboard!</Modal.Body>
            </Modal>

            <img src={logo} width="200" alt="brain logo" className="mb-2" />
            <h1 className="display-1">OTTOMH</h1>

            <div className="d-flex justify-content-center align-items-center gap-3">
                <h2>Code: {id = 1234}</h2>
                <Button className="copy-button" onClick={() => copyToClipBoard(id)} variant="primary">
                    <i className="fa-solid fa-copy"></i>
                </Button>
            </div>
            
            <div className="mt-5">
                <h2>Players joined:</h2>
                <PlayerList />
            </div>
            
            <div className="d-flex justify-content flex-column align-items-center gap-3">
                {hostUser === username ?
                    <Button autoFocus className="d-block" variant="primary" type="submit" onClick={onStart}>Start</Button> : null}
                <Button className="d-block" variant="primary" type="button" onClick={() => { clearStore(); navigate("/") }}>
                    Leave Lobby
                </Button>
            </div>
        </div >
    );
}

WaitState.propTypes = {
    /** the id for this lobby */
    id: PropTypes.string,
    /** a callback function called when the host presses start; this button is visible only to the host. */
    onStart: PropTypes.func,
}
