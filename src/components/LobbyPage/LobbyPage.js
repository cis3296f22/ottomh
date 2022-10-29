import { useState } from "react";
import { useParams } from "react-router-dom";
import { WaitState, Game } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");

    return (
        <>
            {stage === "waitingRoom" && <WaitState onStart={() => setStage("playGame")} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} />}

            {stage === "voting"}

            {stage === "scores"}
        </>
    );
};