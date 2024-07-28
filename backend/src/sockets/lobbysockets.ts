import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import * as lobbyService from '../services/lobbyservice'
import { LobbyStatusInfo } from '../types/lobbyTypes'

/**
 * Checks if the user connecting to the socket is actually a participant.
 */
export const isParticipantMiddleware = async (socket : Socket, next: (err?: ExtendedError) => void) => {
    const authToken = socket.handshake.auth.participantID
    const lobbyCode = socket.handshake.auth.lobbyCode

    if (!authToken || !lobbyCode) {
        const err = new Error('Did not receive a token or a lobby code with the request')
        next(err)
        return
    }

    if (!lobbyService.isValidLobbyCode(lobbyCode) || !lobbyService.isParticipant(lobbyCode, authToken)) {
        const err = new Error('You do not have access to this lobby!')
        next(err)
        return
    }

    const existingParticipantSocket = lobbyService.getParticipantSocket(lobbyCode, authToken)

    if (existingParticipantSocket !== null) {
        const err = new Error('You are already connected to this lobby, probably in another tab. Please open that tab!')
        next(err)
        return
    }


    socket['lobbyCode'] = lobbyCode
    socket['participantID'] = authToken

    lobbyService.assignSocketIDToParticipant(lobbyCode, authToken, socket.id)

    next()
}

export const handleParticipantSocketConnection = (participantSocket : Socket) => {
    const lobbyCode = participantSocket['lobbyCode']
    const participantID = participantSocket['participantID']

    const lobbyStatus = lobbyService.getLobbyStatus(lobbyCode, false)


    if (lobbyStatus.status === 'VOTING' && lobbyService.hasUserVoted(lobbyCode, participantID)) {
        participantSocket.emit('status-change', {status: 'STANDBY'} as LobbyStatusInfo)
    }
    else {
        participantSocket.emit('status-change', lobbyStatus)
    }

    participantSocket.on('disconnect', () => {
        if (!lobbyService.isValidLobbyCode(participantSocket['lobbyCode'])) return
        lobbyService.removeParticipantSocket(participantSocket['lobbyCode'], participantSocket['participantID'])
    })
}
