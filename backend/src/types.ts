export interface LobbyInfo {
    hostID: string,
    status: LobbyStatus,
    availableUserCodes: string[]
}

type LobbyStatus = "STANDBY" | "VOTING"