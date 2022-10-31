import { useState } from "react";
import { useParams } from "react-router-dom";
import { WaitState, Game } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");

    return (
        <div className="container-fluid h-100">
            {stage === "waitingRoom" && <WaitState onStart={() => setStage("playGame")} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} />}

            {stage === "voting"}

            {stage === "scores"}
        </div>
    );
};