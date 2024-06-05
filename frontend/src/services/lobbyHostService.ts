import axios from "axios"

let hostID : string | null= null
let lobbyCode : string | null = null

export const auhtenticateUserWithCode = async (userCode: string) => {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/lobby/authenticateUser`, {
        userCode,
        lobbyCode
    }, {
        headers: {Authorization: hostID}
    })
}

export const setHostID = (newHostID: string) => {
    hostID = newHostID
}

export const setLobbyCode = (newLobbyCode : string) => {
    lobbyCode = newLobbyCode
}

export const getLobbyCode = () : string | null => {
    return lobbyCode
}