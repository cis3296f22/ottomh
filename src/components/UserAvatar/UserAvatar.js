import './userAvatarStyles.css';

export const UserAvatar = ({name}) => {

    // only display the 1st 3 letters of their name
    return(
        <div className="useravatar rounded pe-none user-select-none">
            {/* {name.slice(0, 3)}  */}
            {name} 
        </div>
    );
};