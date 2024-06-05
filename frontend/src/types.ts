export interface LobbyCreationResponse {
    lobbyCode: number;
    hostID: string
}

export interface StatusMessage {
    status: "success" | "error",
    message: string
}

export interface JoinLobbyResponse {
    userCode: string
}