export interface LobbyInfo {
    hostID: string,
    status: LobbyStatus,
    availableUserCodes: string[]
    queuedUsers: Record<string, string|null>
    participants: Record<string, null>
}

type LobbyStatus = 'STANDBY' | 'VOTING'