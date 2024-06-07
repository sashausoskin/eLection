import { LobbyCreationResponse } from "../types"
import { apiClient } from "../util/apiClient"

let hostID : string | null= null
let lobbyCode : string | null = null

export const createLobby = async () => {
    await apiClient.post<LobbyCreationResponse>(`/lobby/createLobby`).then(response => {
        lobbyCode = response.data.lobbyCode
        window.localStorage.setItem('authToken', response.data.hostID)
        hostID = response.data.hostID
    })
}


export const auhtenticateUserWithCode = async (userCode: string) => {
    await apiClient.post(`/lobby/authenticateUser`, {
        userCode,
        lobbyCode
    }, {
        headers: {Authorization: hostID}
    })
}

export const getLobbyCode = () : string | null => {
    return lobbyCode
}