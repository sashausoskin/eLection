import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import * as lobbyService from '../services/lobbyservice'

export const handleParticipantSocketConnection = (participantSocket : Socket) => {
    participantSocket.emit('status-change', lobbyService.getLobbyStatus(participantSocket['lobbyCode']))

    participantSocket.on('disconnect', () => {
        if (!lobbyService.isValidLobbyCode(participantSocket['lobbyCode'])) return
        lobbyService.removeParticipantSocket(participantSocket['lobbyCode'], participantSocket['authToken'])
    })
}

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
    socket['authToken'] = authToken

    lobbyService.assignSocketIDToParticipant(lobbyCode, authToken, socket.id)

    next()
}