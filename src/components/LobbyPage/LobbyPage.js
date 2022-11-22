import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { WaitState, Game, Scores, Voting } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");
    const [cat, setCat] = useState("");
    const [letter, setLetter] = useState("");
    const [isDupWord, setIsDupWord] = useState(null);
    const [wordsArr, setWordsArr] = useState(null);
    const [ws, setHostname, setUserlist, setScorelist, clearStore] = useStore(
        (state) => [state.socket, state.setHostname, state.setUserlist, state.setScorelist, state.clearStore]);
    const navigate = useNavigate();
    // let tempWordsArr = [];

    useEffect(() => {
        ws.onopen = (_) => {
            alert("websocket is open now");

            ws.onmessage = (event) => {
                const packet = event.data;
                const packetObject = JSON.parse(packet);
                switch (packetObject.Event) {
                    case "checkword":
                        setIsDupWord(packetObject.isDupWord);
                        // console.log("received from backend:", "\n", packetObject);
                        break;
                    case "endround":
                        setWordsArr(packetObject.WordList);
                        // tempWordsArr = packetObject.WordList;
                        // setStage("voting")
                        break;
                    case "endvoting":
                        setStage("scores");
                        break;
                    case "getscore":
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
                    default:
                        console.log(`Received data from backend: ${event.data}`);
                }
            }
        }
    });

    ws.onclose = (event) => {
        alert(`websocket is closed now: ${event}`);

        // prevent users from joining a lobby that doesn't exist
        clearStore();
        navigate("/");
    }

    // Action for pressing the "Start" button while on the Waiting Page
    const onStart = () => {
        ws.send(JSON.stringify({ Event: "begingame" }));
    }

    const time_picked = "00:10"


    return (
        <div className="container-fluid h-100">
            <div>stage: {stage}</div>
            {stage === "waitingRoom" && <WaitState onStart={onStart} id={lobbyId} />}

            {stage === "playGame" &&
                <Game
                    onTimeover={() => setStage("voting")}
                    cat={cat}
                    letter={letter}
                    time_picked={time_picked}
                    isDupWord={isDupWord}
                />
            }

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")}
                words={wordsArr} cat={cat} letter={letter} time_picked={time_picked} />}

            {stage === "scores" && <Scores onReplay={() => setStage("waitingRoom")} id={lobbyId} />}
        </div>
    );
};