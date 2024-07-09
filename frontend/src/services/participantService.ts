import { apiClient } from '../util/apiClient'

let lobbyCode: string | null = null
let userCode: string | null = null
let participantID: string | null = null

export const setUserCode = (newUserCode: string) => {
	userCode = newUserCode
}

export const getUserCode = () => {
	return userCode
}

export const setLobbyCode = (newLobbyCode: string) => {
	window.localStorage.setItem('participantLobbyCode', newLobbyCode)
	lobbyCode = newLobbyCode
}

export const getLobbyCode = () => {
	return lobbyCode
}

export const setAuthToken = (newToken: string) => {
	window.localStorage.setItem('participantID', newToken)
	participantID = newToken
}

export const getAuthToken = () => {
	return participantID
}

export const clearValues = () => {
	userCode = null
	lobbyCode = null
	participantID = null

	window.localStorage.clear()
}

export const joinQueue = async (lobbyCode: string): Promise<string | undefined> => {
	const response = await apiClient.post('/lobby/joinLobby', { lobbyCode })
	if (!response.data['userCode']) {
		console.error('Got response for lobbyCode, but did not receive userCode!')
		return
	}

	const userCode = response.data['userCode']

	return userCode
}

export const loadValuesFromStorage = () => {
	lobbyCode = window.localStorage.getItem('participantLobbyCode')
	participantID = window.localStorage.getItem('participantID')

	if (lobbyCode === null || participantID === null) {
		throw new Error('Did not find values in local storage')
	}
}

export const validateStoredUserValues = async () => {
	await apiClient.post('/lobby/validateUserInfo', {
		lobbyCode,
		userID: participantID,
	})
}

export const castVote = async (voteContent: string | string[] | null) => {
	await apiClient.post('/participant/castVote', {
		lobbyCode, voteContent
	}, {
		headers: {
			Authorization: participantID
		}
	})
}