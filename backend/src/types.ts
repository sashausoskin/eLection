export interface LobbyInfo {
    hostID: string,
    status: LobbyStatus,
    availableUserCodes: string[]
    queuedUsers: Record<string, null>
}

type LobbyStatus = "STANDBY" | "VOTING"