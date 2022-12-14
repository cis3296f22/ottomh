import './lobbyPageStyles.css';
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { WaitState, Game, Scores, Voting } from "../";
import Modal from "react-bootstrap/Modal";

/**
 * This component wraps all components related to the currently open lobby:
 * including the waiting page, game page, voting page, and scores page.
 * @returns {JSX.Element}
 */
export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");
    const [cat, setCat] = useState("");
    const [letter, setLetter] = useState("");
    const [isUniqueWord, setIsUniqueWord] = useState(null);
    const [wordsArr, setWordsArr] = useState(['no words were entered collectively']);
    const [showModal, setShowModal] = useState(false);
    const [ws, hostname, setHostname, setUserlist, setScorelist, clearStore] = useStore(
        (state) => [state.socket, state.hostname, state.setHostname, state.setUserlist, state.setScorelist, state.clearStore]);
    const navigate = useNavigate();

    ws.onopen = (_) => {
        ws.onmessage = (event) => {
            const packet = event.data;
            const packetObject = JSON.parse(packet);
            switch (packetObject.Event) {
                case "endround":
                    if (packetObject.TotalWordsArr !== null) {
                        if (packetObject.TotalWordsArr.length !== 0) {
                            setWordsArr(packetObject.TotalWordsArr);
                        }
                    }
                    setStage("voting");
                    break;
                case "endvoting":
                    setStage("scores");
                    ws.send(JSON.stringify({ Event: "getscores" }));
                    break;
                case "getscores":
                    setScorelist(packetObject.Scores);
                    break;
                case "updateusers":
                    setUserlist(packetObject.List);
                    setHostname(packetObject.Host);
                    break;
                case "begingame":
                    // 3 state sets, one re-render by React batching
                    setCat(packetObject.Category);
                    setLetter(packetObject.Letter)
                    setStage("playGame");
                    break;
                case "waitingRoom":
                    setStage("waitingRoom")
                    break;
                case "checkword":
                    setIsUniqueWord(packetObject.isUniqueWord);
                    break;
                default:

            }
        }

        // If we have the hostname, inform the WebSocket
        if (hostname) {
            ws.send(JSON.stringify({ Event: "addhost", Data: hostname }));
        }
    }

    ws.onclose = (event) => {
        setShowModal(true);
    }

    // Action for pressing the "Start" button while on the Waiting Page
    const onStart = () => {
        ws.send(JSON.stringify({ Event: "begingame" }));
    }

    const onReplay = () => {
        ws.send(JSON.stringify({ Event: "waitingRoom" }));
    }

    //change timer to 00:60 on deployment to heroku
    const time_picked = "00:60"


    return (
        <div className="lobby-page container-fluid h-100">
            <Modal style={{ color: "black" }} show={showModal}
                onHide={() => {
                    // prevent users from joining a lobby that doesn't
                    clearStore();
                    navigate("/");
                }}
            >
                <Modal.Header closeButton>Lobby Closed</Modal.Header>
                <Modal.Body>
                    <p>Lobby code '{lobbyId}' has been closed.</p>
                    <p>If you're trying to join a lobby, please double check that your lobby code is correct.</p>
                </Modal.Body>
            </Modal>

            {stage === "waitingRoom" && <WaitState onStart={onStart} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} cat={cat} letter={letter} time_picked={time_picked} isUniqueWord={isUniqueWord} />}

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")}
                words={wordsArr} cat={cat} letter={letter} time_picked={time_picked} />}

            {stage === "scores" && <Scores onReplay={onReplay} />}
        </div>
    );
};