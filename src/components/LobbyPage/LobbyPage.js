import { useState } from "react";
import { useParams } from "react-router-dom";
import { WaitState, Game, Scores } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");
    
    const category = [
        "Food",
        "Animal",
        "Game",
        "Tech"
    ];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let cat = category[Math.floor(Math.random() * category.length)];
    let letter = characters[Math.floor(Math.random() * characters.length)];

    return (
        <div className="container-fluid h-100">
            {stage === "waitingRoom" && <WaitState onStart={() => setStage("playGame")} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} cat={cat} letter={letter}/>}

            {stage === "voting" }

            {stage === "scores" && <Scores />}
        </>
    );
};