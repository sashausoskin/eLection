import { Socket, io } from 'socket.io-client'

export const createLobbySocket = (userCode: string, lobbyCode: string): Socket =>
	io(`${import.meta.env.VITE_BACKEND_URL}/queue`, {
		query: { userCode, lobbyCode},
		autoConnect: false,
	})

export const createViewerSocket = (lobbyCode : string, hostID : string) : Socket => 
	io(`${import.meta.env.VITE_BACKEND_URL}/viewer`, {
		auth: {lobbyCode, hostID },
		autoConnect: false,
	})
