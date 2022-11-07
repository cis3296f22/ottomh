import './playerListStyles.css';
import { useStore } from '../../store';

export const PlayerList = () => {
    const [hostname, userlist] = useStore((state) => [state.hostname, state.userlist]);

    const userComponents = userlist.map((user) => {
        return <p className="playerlist-avatar mx-2 p-2 rounded host">{user}{user === hostname && "[Host]"}</p>
    });

    return (
        <div className="playerlist mx-auto">
            {userComponents}
        </div>
    );
};