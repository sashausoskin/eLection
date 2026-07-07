import { Socket } from 'socket.io'

export interface QueueSocket extends Socket {
    lobbyCode?: string;
    userCode?: string
}

export interface ParticipantSocket extends Socket {
    lobbyCode?: string;
    participantID?: string;
}