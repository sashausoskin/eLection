import { ElectionActivityResponse, ElectionInfo, LobbyCreationResponse } from '../types'
import { apiClient } from '../util/apiClient'

let hostID: string | null = null
let lobbyCode: string | null = null

/**
 * Sends a lobby creation response to the backend
 */
export const createLobby = async () => {
	await apiClient.post<LobbyCreationResponse>('/lobby/createLobby').then((response) => {
		lobbyCode = response.data.lobbyCode
		window.localStorage.setItem('hostID', response.data.hostID)
		window.localStorage.setItem('hostLobbyCode', lobbyCode)
		hostID = response.data.hostID
	})
}

/**
 * Sends an authorization request to the backend.
 * @param userCode - The code of the user to authenticate.
 */
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

/**
 * @returns The code of the host's lobby
 */
export const getLobbyCode = (): string | null => {
	return lobbyCode
}

/**
 * @returns The token of the host
 */
export const getAuthToken = (): string | null => {
	return hostID
}

/**
 * Loads the lobby information stored locally.
 */
export const loadStoredValues = () =>{
	lobbyCode = window.localStorage.getItem('hostLobbyCode')
	hostID = window.localStorage.getItem('hostID')
}

/**
 * Tries to load lobby information from local storage and verify from the backend if it is valid.
 */
export const validateStoredValues = async () => {
	loadStoredValues()

	if (lobbyCode === undefined || hostID === undefined) {
		throw new Error('Did not find values in local storage')
	}

	await apiClient.post('/lobby/validateHostInfo', {
		lobbyCode,
		hostID,
	})
}
/**
 * Clears all of the stored values relating to the host's lobby information.
 */
export const clearSavedInfo = () => {
	window.localStorage.removeItem('hostLobbyCode')
	window.localStorage.removeItem('hostID')
	hostID = null
	lobbyCode = null
}

/**
 * Sends a request to the backend to create an election
 * @param electionInfo Information on the election to create.
 */
export const createElection = async (electionInfo : ElectionInfo) => {
	await apiClient.post('/host/createElection',
		{lobbyCode, electionInfo},
		{headers: {
			Authorization: hostID
		}}
	)
}

/**
 * Sends a request to the backend to end an active election.
 */
export const endElection = async () => {
	await apiClient.post('/host/endElection', {lobbyCode}, {headers: {
		Authorization: hostID
	}})
}

/**
 * Sends a request to the backend to close the current lobby.
 */
export const closeLobby = async () => {
	await apiClient.post('/host/closeLobby', {lobbyCode}, {headers: {
		Authorization: hostID
	}})
}

/**
 * Asks the backend if there is an active election going on in the host's lobby
 * @returns An object with information on if the election is active.
 */
export const getElectionStatus = async () => await (
	apiClient.get<ElectionActivityResponse>('/host/getElectionStatus', {
		params: {lobbyCode},
		headers: {
			Authorization: hostID
	}})
)