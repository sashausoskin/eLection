export interface LobbyInfo {
    hostID: string,
    viewerSocket: string | null,
    status: LobbyStatus,
    availableUserCodes: string[]
    queuedUsers: Record<string, string|null>
    participants: Record<string, null|string>
    currentVote : {
        electionInfo: ElectionInfo,
        results: ElectionResults
    } | null
}
type LobbyStatus = 'STANDBY' | 'VOTING' | 'ELECTION_ENDED'

export type LobbyStatusInfo = {
    status: 'STANDBY'
} | {
    status: 'VOTING',
    electionInfo: ElectionInfo
} | {
    status: 'ELECTION_ENDED',
    results?: ElectionResultsInfo
}

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