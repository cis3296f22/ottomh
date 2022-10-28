import create from 'zustand';

export const useStore = create((set) => ({
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
}));