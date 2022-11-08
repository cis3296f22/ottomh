import { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store";
import { WaitState, Game, Scores, Voting } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");
    const [ws, username, hostname, setHostname, setUserlist] = useStore(
        (state) => [state.socket, state.username, state.hostname, state.setHostname, state.setUserlist]);
    
    const category = [
        "Food",
        "Animal",
        "Game",
        "Tech"
    ];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let cat = category[Math.floor(Math.random() * category.length)];
    let letter = characters[Math.floor(Math.random() * characters.length)];

    ws.onopen = (_) => {
        alert("websocket is open now");

        ws.onmessage = (event) => {
            const packet = event.data;
            const packetObject = JSON.parse(packet);
            switch (packetObject.Event) {
                case "updateusers":
                    setUserlist(packetObject.List);
                    setHostname(packetObject.Host);
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

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} cat={cat} letter={letter} ws={ws}/>}

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")} 
                words={['Lorem', 'Ipsum', 'is', 'simply', 'dummy', 'text', 'of', 'the', 'printing', 'and', 'typesetting',
                        'industry', 'The', 'first', 'list', 'was', 'too', 'short', 'for', 'testing', 'scroll', 'so',
                        'here', 'I', 'am', 'manually', 'extending', 'it']}/>}

            {stage === "scores" && <Scores />}
        </div>
    );
};