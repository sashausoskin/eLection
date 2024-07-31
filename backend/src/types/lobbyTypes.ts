

export interface LobbyInfo {
    hostID: string
    lastActivity: number
    viewerSocket: string | null
    status: LobbyStatus
    availableUserCodes: string[]
    queuedUsers: Record<string, string | null>
    participants: Record<string, null | string>
    currentVote: {
        electionInfo: ElectionInfo
        results: ElectionResults
    } | null
}
type LobbyStatus = 'STANDBY' | 'VOTING' | 'ELECTION_ENDED' | 'CLOSING'

export type LobbyStatusInfo = {
    status: 'STANDBY'
} | {
    status: 'VOTING'
    electionInfo: ElectionInfo
} | {
    status: 'ELECTION_ENDED'
    results?: ElectionResultsInfo
} | {
    status: 'CLOSING'
    reason: LobbyCloseReason
}

export type LobbyCloseReason = 'INACTIVITY' | 'HOST_CLOSED'

type ElectionInfoBase = {
    /**
     * The name of the election
     *
     * @TJS-type string
     * @require
     * @maxLength 80
     */
    title: string
    /**
     * The list of candidates
     *
     * @items.type string
     * @minItems 2
     * @maxItems 20
     * @require(".")
     */
    candidates: string[]
}
interface FPRPElectionInfo extends ElectionInfoBase {
    type: 'FPTP'
}
interface RankedElectionInfo extends ElectionInfoBase {
    type: 'ranked'
    /**
     * How many candidates should the participant rank?
     *
     * @minimum 2
     * @TJS-type number
     * @require
     */
    candidatesToRank: number
}

export type ElectionInfo = FPRPElectionInfo | RankedElectionInfo

export interface ElectionResults {
    votes: Record<string | null, number>
    emptyVotes: number
    usersVoted: string[]
}

export type ElectionResultsInfo = Omit<ElectionResults, 'usersVoted'> & Pick<ElectionInfo, 'type' | 'title'>

export interface VoteInfo {
    votes: number
    participants: number
}

