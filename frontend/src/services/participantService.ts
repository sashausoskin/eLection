import { apiClient } from '../util/apiClient'

let lobbyCode: string | null = null
let userCode: string | null = null
let participantToken: string | null = null

/**
 * Saves the user code in memory.
 * @param newUserCode User code to save.
 */
export const setUserCode = (newUserCode: string) => {
	userCode = newUserCode
}
/**
 * @returns The user code stored in memory
 */
export const getUserCode = () => {
	return userCode
}

/**
 * Sets the lobby code stored in memory.
 * @param newLobbyCode The lobby code to save.
 */
export const setLobbyCode = (newLobbyCode: string) => {
	lobbyCode = newLobbyCode
}

/**
 * 
 * @returns The lobby code stored in memory
 */
export const getLobbyCode = () => {
	return lobbyCode
}

/**
 * Sets the authorization token stored in memory
 * @param newToken The token to store.
 */
export const setAuthToken = (newToken: string) => {
	window.localStorage.setItem('participantToken', `Bearer ${newToken}`)
	participantToken = `Bearer ${newToken}`
}

/**
 * Gets the authorization token stored in memory
 */
export const getAuthToken = () => {
	return participantToken
}

/**
 * Clears the locally stored values.
 */
export const clearValues = () => {
	userCode = null
	lobbyCode = null
	participantToken = null

	window.localStorage.removeItem('participantToken')
}

/**
 * Sends a request to the backend to join a queue
 * @param lobbyCode The code of the lobby to which the user wishes to join.
 * @returns The user code that the backend service has chosen.
 */
export const joinQueue = async (lobbyCode: string): Promise<string | null> => {
	const response = await apiClient.post('/lobby/joinLobby', { lobbyCode })
	if (!response.data.userCode) {
		console.error('Got response for lobbyCode, but did not receive userCode!')
		return null
	}

	userCode = response.data.userCode

	return userCode
}

/**
 * Loads the values stored in storage and checks with the backend if they are valid.
 */
export const validateStoredUserValues = async () => {
	participantToken = window.localStorage.getItem('participantToken')

	if (participantToken === null) {
		throw new Error('Did not find values in local storage')
	}

	await apiClient.post('/lobby/validateUserInfo', undefined, {
		headers: {
			Authorization: participantToken
		}
	})
}
/**
 * Sends a request to cast a vote.
 * @param voteContent The content of the vote
 */
export const castVote = async (voteContent: string | string[] | null) => {
	await apiClient.post('/participant/castVote', {
		voteContent
	}, {
		headers: {
			Authorization: participantToken
		}
	})
}