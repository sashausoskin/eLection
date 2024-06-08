let lobbyCode : string | null = null
let userCode : string | null = null

export const setUserCode = (newUserCode : string) => {
    userCode = newUserCode
}

export const getUserCode = () => {
    return userCode
}

export const setLobbyCode = (newLobbyCode : string) => {
    lobbyCode = newLobbyCode
}

export const getLobbyCode = () => {
    return lobbyCode
}