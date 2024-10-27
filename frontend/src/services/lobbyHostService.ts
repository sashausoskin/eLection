import { ElectionActivityResponse, ElectionInfo, LobbyCreationResponse } from '../types'
import { apiClient } from '../util/apiClient'

let hostToken: string | null = null
let lobbyCode: string | null = null

/**
 * Sends a lobby creation response to the backend
 */
export const createLobby = async () => {
	await apiClient.post<LobbyCreationResponse>('/lobby/createLobby').then((response) => {
		lobbyCode = response.data.lobbyCode
		hostToken = `Bearer ${response.data.token}`
		window.localStorage.setItem('hostToken', hostToken)
		window.localStorage.setItem('hostLobbyCode', lobbyCode)

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
			headers: { Authorization: hostToken },
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
	return hostToken
}

/**
 * Loads the lobby information stored locally.
 */
export const loadStoredValues = () =>{
	hostToken = window.localStorage.getItem('hostToken')
	lobbyCode = window.localStorage.getItem('hostLobbyCode')
}

/**
 * Tries to load lobby information from local storage and verify from the backend if it is valid.
 */
export const validateStoredValues = async () => {
	loadStoredValues()

	if (lobbyCode === undefined || hostToken === undefined) {
		throw new Error('Did not find values in local storage')
	}

	await apiClient.post('/lobby/validateHostInfo', {}, {
		headers: {
			Authorization: hostToken
		}
	})
}
/**
 * Clears all of the stored values relating to the host's lobby information.
 */
export const clearSavedInfo = () => {
	window.localStorage.removeItem('hostToken')
	window.localStorage.removeItem('hostLobbyCode')
	hostToken = null
	lobbyCode = null
}

/**
 * Sends a request to the backend to create an election
 * @param electionInfo Information on the election to create.
 */
export const createElection = async (electionInfo : ElectionInfo) => {
	await apiClient.post('/host/createElection',
		{electionInfo},
		{headers: {
			Authorization: hostToken
		}}
	)
}

/**
 * Sends a request to the backend to end an active election.
 */
export const endElection = async () => {
	await apiClient.post('/host/endElection', {}, {headers: {
		Authorization: hostToken
	}})
}

/**
 * Sends a request to the backend to close the current lobby.
 */
export const closeLobby = async () => {
	await apiClient.post('/host/closeLobby', {}, {headers: {
		Authorization: hostToken
	}})
}

/**
 * Asks the backend if there is an active election going on in the host's lobby
 * @returns An object with information on if the election is active.
 */
export const getElectionStatus = async () => await (
	apiClient.get<ElectionActivityResponse>('/host/getElectionStatus', {
		headers: {
			Authorization: hostToken
		}})
)