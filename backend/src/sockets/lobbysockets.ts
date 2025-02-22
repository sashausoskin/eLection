import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import * as lobbyService from '../services/lobbyservice'
import * as socketservice from '../services/socketservice'
import { LobbyStatusInfo } from '../types/lobbyTypes'
import { decodeObject } from '../util/encryption'
import { AuthenticationObject } from '../types/communicationTypes'
import { io } from '../util/server'

/**
 * Checks if the user connecting to the socket is actually a participant.
 */
export const isParticipantMiddleware = async (socket : Socket, next: (err?: ExtendedError) => void) => {
    const auth = socket.handshake.auth.token

    if (!auth) {
        const err = new Error('Did not receive an authentication token with the request')
        next(err)
        return
    }

    let decodedAuth

    try {
        decodedAuth = decodeObject(auth.substring(7)) as AuthenticationObject
    }
    catch {
        const err = new Error('Invalid authentication token')
        next(err)
        return
    }

    const userID = decodedAuth.id
    const lobbyCode = decodedAuth.lobbyCode

    if (!userID || !lobbyCode) {
        const err = new Error('Did not receive a token or a lobby code with the request')
        next(err)
        return
    }

    if (!lobbyService.isValidLobbyCode(lobbyCode) || !lobbyService.isParticipant(lobbyCode, userID)) {
        const err = new Error('You do not have access to this lobby!')
        next(err)
        return
    }

    const existingParticipantSocket = socketservice.getParticipantSocket(lobbyCode, userID)

    if (existingParticipantSocket !== null) {
        io.of('/lobby').in(existingParticipantSocket).disconnectSockets()
    }


    socket['lobbyCode'] = lobbyCode
    socket['participantID'] = userID

    socketservice.assignSocketIDToParticipant(lobbyCode, userID, socket.id)

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
        socketservice.removeParticipantSocket(participantSocket['lobbyCode'], participantSocket['participantID'])
    })
}
