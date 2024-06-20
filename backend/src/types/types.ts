export interface LobbyInfo {
    hostID: string,
    viewerSocket: string | null,
    status: LobbyStatus,
    availableUserCodes: string[]
    queuedUsers: Record<string, string|null>
    participants: Record<string, null|string>
    currentVote : ElectionInfo | null
    results: ElectionResults | null
}

type LobbyStatus = 'STANDBY' | 'VOTING'

export type LobbyStatusInfo = Omit<LobbyInfo, 'hostID' | 'availableUserCodes' | 'queuedUsers' | 'participants' | 'viewerSocket' | 'results'>

export type ErrorMessage = {
    type: ErrorType,
    message: string
}

type ErrorType = 'MISSING_AUTH_TOKEN' | 'MISSING_LOBBY_CODE' | 'UNAUTHORIZED' | 'NO_ACTIVE_ELECTION' | 'MALFORMATTED_REQUEST' | 'ALREADY_VOTED'

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
    type: 'FPTP'
}

export type ElectionInfo = FPRPElectionInfo

export interface ElectionResults {
    votes: Record<string, number>
    usersVoted: string[]
}