import './playerListStyles.css';
import { useStore } from '../../store';

export const PlayerList = () => {

    const playerName = useStore((state) => state.username);
    const hostName = useStore((state) => state.hostname);
    const playersName =  "[Host: " + hostName + "] \n\n[Players: " + playerName + "]"

    // const userList = [
    //     "pikachu",
    //     "bulbasaur",
    //     "meowth",
    //     "charzard",
    //     "puppycat",
    //     "shiba inu",
    //     "raven",
    //     "beastboy",
    //     "batman",
    //     "superman",
    //     "john doe",
    //     "jane doe",
    //     "seraphina",
    //     "august",
    //     "odette",
    //     "perry",
    //     "coconut",
    //     "strawberry",
    //     "peach"
    // ];

    return (
        <div className="playerlist mx-auto">
            {/* {userList.map((user, index) => ( */}
                <p className="playerlist-avatar mx-2 p-2 rounded host">{playersName}</p>
            {/* ))} */}
        </div>
    );
};