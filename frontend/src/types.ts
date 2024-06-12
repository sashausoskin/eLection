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

export interface LobbyStatusInfo {
	status: "STANDBY" | "VOTING"
}

export type VoteType = "FPTP" | "ranked"