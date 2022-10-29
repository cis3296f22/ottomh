import './userListStyles.css';
import { UserAvatar } from '../';
import ScrollContainer from 'react-indiana-drag-scroll';

export const UserList = () => {

    const userList = [
        "pikachu",
        "bulbasaur",
        "meowth",
        "charzard",
        "puppycat",
        "shiba inu",
        "raven",
        "beastboy",
        "batman",
        "superman",
        "john doe",
        "jane doe",
        "seraphina",
        "august",
        "odette",
        "perry",
        "coconut",
        "strawberry",
        "peach"
    ];

    return (
        <div className="userlist mx-auto">
            <ScrollContainer className="scroll-container userlist-users-container h-100 d-flex">
                {userList.map((user, index) => (<UserAvatar name={user} key={index} />))}
            </ScrollContainer>
        </div>
    );
};