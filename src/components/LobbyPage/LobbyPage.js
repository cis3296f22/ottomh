import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { WaitState, Game, Scores, Voting } from "../";
import Modal from "react-bootstrap/Modal";

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
                    console.log(`Received data from backend: ${event.data}`);
            }
        }

        // If we have the hostname, inform the WebSocket
        if (hostname) {
            ws.send(JSON.stringify({ Event: "addhost", Data: hostname }));
        }
    }

    ws.onclose = (event) => {
        setShowModal(true);
        setTimeout(() => {
            // show modal popup letting user know that the lobby is closed
            setShowModal(false);

            // prevent users from joining a lobby that doesn't
            clearStore();
            navigate("/");
        }, "3000");
    }

    // Action for pressing the "Start" button while on the Waiting Page
    const onStart = () => {
        ws.send(JSON.stringify({ Event: "begingame" }));
    }

    const onReplay = () => {
        ws.send(JSON.stringify({ Event: "waitingRoom" }));
    }

    //change timer to 00:60 on deployment to heroku
    const time_picked = "00:30"


    return (
        <div className="container-fluid h-100">
            <Modal style={{color: "black"}} show={showModal}>
                <Modal.Body>Lobby code '{lobbyId}'' doesn't exist.</Modal.Body>
            </Modal>

            {stage === "waitingRoom" && <WaitState onStart={onStart} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} cat={cat} letter={letter} time_picked={time_picked} isUniqueWord={isUniqueWord} />}

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")}
                words={wordsArr} cat={cat} letter={letter} time_picked={time_picked} />}

            {stage === "scores" && <Scores onReplay={onReplay} />}
        </div>
    );
};