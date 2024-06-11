import { apiClient } from "../util/apiClient"

let lobbyCode : string | null = null
let userCode : string | null = null
let userID : string | null = null

export const setUserCode = (newUserCode : string) => {
    userCode = newUserCode
}

export const getUserCode = () => {
    return userCode
}

export const setLobbyCode = (newLobbyCode : string) => {
    window.localStorage.setItem('participantLobbyCode', newLobbyCode)
    lobbyCode = newLobbyCode
}

export const getLobbyCode = () => {
    return lobbyCode
}

export const setAuthToken = (newToken : string) => {
    window.localStorage.setItem('participantID', newToken)
    userID = newToken
}

export const getAuthToken = () => {
    return userID
}

export const clearValues = () => {
    userCode = null
    lobbyCode = null
    userID = null

    window.localStorage.clear()
}

export const loadValuesFromStorage = () => {
    lobbyCode = window.localStorage.getItem('participantLobbyCode')
    userID = window.localStorage.getItem('participantID')

    if (lobbyCode === null || userID === null) {
        throw new Error('Did not find values in local storage')
    }
}

export const validateStoredUserValues = async () => {
    await apiClient.post('/lobby/validateUserInfo', {
        lobbyCode, userID
    })
}

