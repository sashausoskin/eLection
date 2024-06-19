export interface LobbyCreationResponse {
	lobbyCode: string;
	hostID: string;
}

export interface StatusMessage {
	status: 'success' | 'error';
	message: string;
}

export interface JoinLobbyResponse {
	userCode: string;
}

export type ParticipantViewTab = 'joinLobby' | 'inQueue' | 'inLobby';

export type LobbyStatusInfo = {
	status: 'STANDBY',
    currentVote: null
} | {
    status: 'VOTING',
    currentVote: ElectionInfo
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

export type ElectionInfo = FPTPElectionInfo