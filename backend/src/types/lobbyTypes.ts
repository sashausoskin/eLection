
interface LobbyInfoWithElectionInfo extends LobbyInfoBase {
    status: Extract<LobbyStatus, 'VOTING' | 'ELECTION_ENDED'>
    currentVote: LobbyVoteInfo
}

interface LobbyInfoWithoutElectionInfo extends LobbyInfoBase {
    status: Exclude<LobbyStatus, 'VOTING' | 'ELECTION_ENDED'>
}

interface LobbyVoteInfo {
    electionInfo: ElectionInfo
    results: ElectionResults
}

interface LobbyInfoBase {
    hostID: string
    lastActivity: number
    viewerSocket: string | null
    availableUserCodes: string[]
    queuedUsers: Record<string, string | null>
    participants: Record<string, string | null>
    currentVote: LobbyVoteInfo | null
}

export type LobbyInfo = LobbyInfoWithElectionInfo | LobbyInfoWithoutElectionInfo

export type LobbyStatus = 'STANDBY' | 'VOTING' | 'ELECTION_ENDED' | 'CLOSING'

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
    votes: Record<string, number>
    emptyVotes: number
    usersVoted: string[]
}

export type ElectionResultsInfo = Omit<ElectionResults, 'usersVoted'> & Pick<ElectionInfo, 'type' | 'title'>

export interface VoteInfo {
    votes: number
    participants: number
}

export interface LobbyActivity {
    /**
     * The code of the lobby
     */
    lobbyCode : string,
    /**
     * The {@link Date} on which the lobby has been last active
     */
    lastActivity: number
}
