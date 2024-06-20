import { Socket, io } from 'socket.io-client'

export const createQueueSocket = (userCode: string, lobbyCode: string): Socket =>
	io(`${import.meta.env.VITE_BACKEND_URL}/queue`, {
		auth: { userCode, lobbyCode},
		autoConnect: false,
	})

export const createViewerSocket = (lobbyCode : string, hostID : string) : Socket => 
	io(`${import.meta.env.VITE_BACKEND_URL}/viewer`, {
		auth: {lobbyCode, hostID },
		autoConnect: false,
	})

export const createLobbySocket = (lobbyCode : string, participantID : string) : Socket => 
	io(`${import.meta.env.VITE_BACKEND_URL}/lobby`, {
		auth: {lobbyCode, participantID },
		autoConnect: false,
	})

