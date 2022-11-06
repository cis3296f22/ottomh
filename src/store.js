import create from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
    devtools(
        (set) => ({
            hostname:'',
            username: '',
            lobbyId: '',
            setHostname: (name) => set(() => ({ hostname: name })),
            setUsername: (name) => set(() => ({ username: name })),
            setLobbyId: (id) => set(() => ({ lobbyId: id })),
            clearStore: () => set(() => (
                {
                    hostname:"",
                    username: "",
                    lobbyId: ""
                }
            )),
        })
    )
);