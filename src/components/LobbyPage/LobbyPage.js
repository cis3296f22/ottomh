import { useState } from "react";
import { useParams } from "react-router-dom";
import { WaitState, Game, Scores, Voting } from "../";

export const LobbyPage = () => {
    const { lobbyId } = useParams();
    const [stage, setStage] = useState("waitingRoom");

    return (
        <>
            {stage === "waitingRoom" && <WaitState onStart={() => setStage("playGame")} id={lobbyId} />}

            {stage === "playGame" && <Game onTimeover={() => setStage("voting")} />}

            {stage === "voting" && <Voting onTimeover={() => setStage("scores")} 
                words={['Lorem', 'Ipsum', 'is', 'simply', 'dummy', 'text', 'of', 'the', 'printing', 'and', 'typesetting',
                        'industry', 'The', 'first', 'list', 'was', 'too', 'short', 'for', 'testing', 'scroll', 'so',
                        'here', 'I', 'am', 'manually', 'extending', 'it']}/>}

            {stage === "scores" && <Scores />}
        </>
    );
};