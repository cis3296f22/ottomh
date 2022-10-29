import create from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
    devtools(
        (set) => ({
            username: '',
            lobbyId: '',
            setUsername: (name) => set(() => ({ username: name })),
            setLobbyId: (id) => set(() => ({ lobbyId: id })),
            clearStore: () => set(() => (
                {
                    username: "",
                    lobbyId: ""
                }
            )),
        })
    )
);