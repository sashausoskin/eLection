export interface LobbyInfo {
    hostID: string,
    status: LobbyStatus,
    availableUserCodes: string[]
    queuedUsers: Record<string, string|null>
    participants: Record<string, null>
    currentVote : ElectionInfo | null
}

type LobbyStatus = 'STANDBY' | 'VOTING'

export type LobbyStatusInfo = Omit<LobbyInfo, "hostID" | "availableUserCodes" | "queuedUsers" | "participants">

export type ErrorMessage = {
    type: ErrorType,
    message: string
}

type ErrorType = "MISSING_AUTH_TOKEN" | "MISSING_LOBBY_CODE" | "UNAUTHORIZED"

type ElectionInfoBase = {
    /**
     * The name of the election
     * 
     * @minimum 0
     * @TJS-type string
     */
    title: string,
    /**
     * The list of candidates
     * 
     * @items.type string
     * @items.minimum 2
     */
    candidates: string[]
}

interface FPRPElectionInfo extends ElectionInfoBase {
    type: "FPTP"
}

export type ElectionInfo = FPRPElectionInfo