export interface LobbyInfo {
    hostID: string,
    viewerSocket: string | null,
    status: LobbyStatus,
    availableUserCodes: string[]
    queuedUsers: Record<string, string|null>
    participants: Record<string, null|string>
    currentVote : ElectionInfo | null
}

type LobbyStatus = 'STANDBY' | 'VOTING'

export type LobbyStatusInfo = Omit<LobbyInfo, "hostID" | "availableUserCodes" | "queuedUsers" | "participants" | "viewerSocket">

export type ErrorMessage = {
    type: ErrorType,
    message: string
}

type ErrorType = "MISSING_AUTH_TOKEN" | "MISSING_LOBBY_CODE" | "UNAUTHORIZED"

type ElectionInfoBase = {
    /**
     * The name of the election
     * 
     * @TJS-type string
     * @require
     */
    title: string,
    /**
     * The list of candidates
     * 
     * @items.type string
     * @minItems 2
     * @require(".")
     */
    candidates: string[]
}

interface FPRPElectionInfo extends ElectionInfoBase {
    type: "FPTP"
}

export type ElectionInfo = FPRPElectionInfo