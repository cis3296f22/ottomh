import { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store";
import { WaitState, Game, Scores, Voting } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");
    const [cat, setCat] = useState("");
    const [letter, setLetter] = useState("");
    const [ws, username, hostname, setHostname, setUserlist] = useStore(
        (state) => [state.socket, state.username, state.hostname, state.setHostname, state.setUserlist]);

    ws.onopen = (_) => {
        alert("websocket is open now");

        ws.onmessage = (event) => {
            const packet = event.data;
            const packetObject = JSON.parse(packet);
            switch (packetObject.Event) {
                case "endround":
                    setStage("voting");
                    break;
                case "endvoting":
                    setStage("scores");
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

        // If we have the hostname, inform the WebSocket
        if (hostname) {
            ws.send(JSON.stringify({Event: "addhost", Data: hostname}));
        }
    }

    ws.onclose = (_) => {
        alert("websocket is closed now");
    }

    // Action for pressing the "Start" button while on the Waiting Page
    const onStart = () => {
        ws.send(JSON.stringify({Event: "begingame"}));
    }

    return (
        <div className="container-fluid h-100">
            {stage === "waitingRoom" && <WaitState onStart={onStart} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} cat={cat} letter={letter} />}

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")} 
                words={['Lorem', 'Ipsum', 'is', 'simply', 'dummy', 'text', 'of', 'the', 'printing', 'and', 'typesetting',
                        'industry', 'The', 'first', 'list', 'was', 'too', 'short', 'for', 'testing', 'scroll', 'so',
                        'here', 'I', 'am', 'manually', 'extending', 'it']} cat={cat} letter={letter}/>}

            {stage === "scores" && <Scores />}
        </div>
    );
};