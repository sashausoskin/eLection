/**
 * What a host should receive in response when they request to create a lobby.
 */
export interface LobbyCreationResponse {
	lobbyCode: string;
	token: string;
}

export interface StatusMessage {
	status: 'success' | 'error';
	message: string;
}
/**
 * What a user should receive when they request to join a valid lobby.
 */
export interface JoinLobbyResponse {
	userCode: string;
}

/**
 * The different views that a participant can have.
 */
export type ParticipantViewTab = 'joinLobby' | 'inQueue' | 'inLobby';

export type LobbyStatusInfo = {
    status: 'STANDBY'
} | {
    status: 'VOTING',
    electionInfo: ElectionInfo
} | {
    status: 'ELECTION_ENDED',
    results: ElectionResultsInfo
} | {
    status: 'CLOSING',
    reason: 'INACTIVITY' | 'HOST_CLOSED'
}



export type ElectionType = 'FPTP' | 'ranked'

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

export interface FPTPElectionInfo extends ElectionInfoBase {
    type: 'FPTP'
}

export interface RankedElectionInfo extends ElectionInfoBase {
    type: 'ranked',
    candidatesToRank: number
}

export type ElectionInfo = FPTPElectionInfo | RankedElectionInfo

/**
 * A message the user receives from backend if something goes wrong.
 */
export type ErrorMessage = {
    type: ErrorType,
    message: string
}

type ErrorType = 'MISSING_AUTH_TOKEN' | 'MISSING_LOBBY_CODE' | 'UNAUTHORIZED' | 'NO_ACTIVE_ELECTION' | 'MALFORMATTED_REQUEST' | 'ALREADY_VOTED' | 'NOT_FOUND'

export interface ElectionResults {
    votes: Record<string, number>
    emptyVotes: number
}

export type ElectionResultsInfo = Omit<ElectionResults, 'usersVoted'> & Pick<ElectionInfo, 'type' | 'title'>

export type LobbyStatusResponse = {
    electionActive: boolean,
    resultsAvailable: boolean
}

export interface ResultCandidateInfo {
    position: number
    name: string
    votes: number
}

interface PopupInfoBase {
    /**
     * The message that will be shown to the user with the popup.
     */
    message: string
    /**
     * A function that is called if the user presses 'Accept'.
     */
    onConfirm?: () => void | Promise<void>
}

/**
 * Alert that is meant to deliver a message to the user. Should only show an accept button.
 */
interface AlertPopupInfo extends PopupInfoBase {
    type: 'alert'
}

/**
 * A confirm popup is meant to confirm something from the user. Should have an accept and a reject button.
 */
interface ConfirmPopupInfo extends PopupInfoBase {
    type: 'confirm'
    /**
     * Function that is called if the user presses 'Reject'.
     * @returns null
     */
    onCancel?: () => void | Promise<void>
}

export type PopupInfo = AlertPopupInfo | ConfirmPopupInfo