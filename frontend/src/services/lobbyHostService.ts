import { ElectionInfo, LobbyCreationResponse } from '../types'
import { apiClient } from '../util/apiClient'

let hostID: string | null = null
let lobbyCode: string | null = null

export const createLobby = async () => {
	await apiClient.post<LobbyCreationResponse>('/lobby/createLobby').then((response) => {
		lobbyCode = response.data.lobbyCode
		window.localStorage.setItem('hostID', response.data.hostID)
		window.localStorage.setItem('hostLobbyCode', lobbyCode)
		hostID = response.data.hostID
	})
}

export const auhtenticateUserWithCode = async (userCode: string) => {
	await apiClient.post(
		'/host/authenticateUser',
		{
			userCode,
			lobbyCode,
		},
		{
			headers: { Authorization: hostID },
		}
	)
}

export const getLobbyCode = (): string | null => {
	return lobbyCode
}

export const validateInfoFromStorage = async () => {
	lobbyCode = window.localStorage.getItem('hostLobbyCode')
	hostID = window.localStorage.getItem('hostID')

	if (lobbyCode === undefined || hostID === undefined) {
		throw new Error('Did not find values in local storage')
	}

	await apiClient.post('/lobby/validateHostInfo', {
		lobbyCode,
		hostID,
	})
}

export const clearSavedInfo = () => {
	window.localStorage.removeItem('hostLobbyCode')
	window.localStorage.removeItem('hostID')
	hostID = null
	lobbyCode = null
}

export const createElection = async (electionInfo : ElectionInfo) => {
	await apiClient.post('/host/createElection',
		{lobbyCode, electionInfo},
		{headers: {
			Authorization: hostID
		}}
	)
}

export const endElection = async () => {
	await apiClient.post('/host/endElection', {lobbyCode}, {headers: {
		Authorization: hostID
	}})
}

export const closeLobby = async () => {
	await apiClient.post('/host/closeLobby', {lobbyCode}, {headers: {
		Authorization: hostID
	}})
}

export const getElectionStatus = async () => await (
	apiClient.get('/host/getElectionStatus', {
		params: {lobbyCode},
		headers: {
			Authorization: hostID
	}})
)