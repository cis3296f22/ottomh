import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { WaitState, Game, Scores, Voting } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");
    const [cat, setCat] = useState("");
    const [letter, setLetter] = useState("");
<<<<<<< HEAD
    const [isDupWord, setIsDupWord] = useState(null);
    const [wordsArr, setWordsArr] = useState(null);
    const [ws, setHostname, setUserlist, setScorelist, clearStore] = useStore(
        (state) => [state.socket, state.setHostname, state.setUserlist, state.setScorelist, state.clearStore]);
=======
    const [isUniqueWord, setIsUniqueWord] = useState(null);
    const [wordsArr, setWordsArr] = useState(['no words were entered collectively']);
    const [ws, hostname, setHostname, setUserlist, setScorelist, clearStore] = useStore(
        (state) => [state.socket, state.hostname, state.setHostname, state.setUserlist, state.setScorelist, state.clearStore]);
>>>>>>> lobby-frontend
    const navigate = useNavigate();
    // let tempWordsArr = [];

    useEffect(() => {
        ws.onopen = (_) => {
            alert("websocket is open now");

<<<<<<< HEAD
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
=======
        ws.onmessage = (event) => {
            const packet = event.data;
            const packetObject = JSON.parse(packet);
            switch (packetObject.Event) {
                case "endround":
                    if(packetObject.TotalWordsArr !== null) {
                        if(packetObject.TotalWordsArr.length !== 0) {
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
>>>>>>> lobby-frontend

    ws.onclose = (event) => {
        alert(`websocket is closed now: ${event}`);

        // prevent users from joining a lobby that doesn't exist
        clearStore();
        navigate("/");
    }

    // Action for pressing the "Start" button while on the Waiting Page
    const onStart = () => {
<<<<<<< HEAD
        ws.send(JSON.stringify({ Event: "begingame" }));
    }

    const time_picked = "00:10"
=======
        ws.send(JSON.stringify({ Event: "begingame", Data: lobbyId }));
    }

    const onReplay = () => {
        ws.send(JSON.stringify({ Event: "waitingRoom" }));
    }

    //change timer to 00:60 on deployment to heroku
    const time_picked = "00:30"
>>>>>>> lobby-frontend


    return (
        <div className="container-fluid h-100">
            <div>stage: {stage}</div>
            {stage === "waitingRoom" && <WaitState onStart={onStart} id={lobbyId} />}

<<<<<<< HEAD
            {stage === "playGame" &&
                <Game
                    onTimeover={() => setStage("voting")}
                    cat={cat}
                    letter={letter}
                    time_picked={time_picked}
                    isDupWord={isDupWord}
                />
            }
=======
            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} cat={cat} letter={letter} time_picked={time_picked} isUniqueWord={isUniqueWord} />}
>>>>>>> lobby-frontend

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")}
                words={wordsArr} cat={cat} letter={letter} time_picked={time_picked} />}

<<<<<<< HEAD
            {stage === "scores" && <Scores onReplay={() => setStage("waitingRoom")} id={lobbyId} />}
=======
            {stage === "scores" && <Scores onReplay={onReplay} id={lobbyId} />}
>>>>>>> lobby-frontend
        </div>
    );
};