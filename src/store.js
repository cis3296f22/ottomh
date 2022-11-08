import create from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
    devtools(
        (set) => ({
            hostname:'',
            username: '',
            lobbyId: '',
            socket: '',
            userlist: [],
            setHostname: (name) => set(() => ({ hostname: name })),
            setUsername: (name) => set(() => ({ username: name })),
            setLobbyId: (id) => set(() => ({ lobbyId: id })),
            setSocket: (s) => set(() => ({ socket: s })),
            setUserlist: (list) => set(() => ({ userlist: list})),
            clearStore: () => set(() => (
                {
                    hostname:"",
                    username: "",
                    lobbyId: "",
                    socket: ""
                }
            )),
        })
    )
);