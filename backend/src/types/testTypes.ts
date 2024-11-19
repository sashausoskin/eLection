export interface LobbyWithUserCreationResponse {
    participantToken : string,
    hostToken : string,
    lobbyCode : string,
    participantID: string,
    hostID: string
}

export interface LobbyCreationResponse {
    token: string,
    lobbyCode: string
}