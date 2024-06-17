import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import * as lobbyService from '../services/lobbyservice'

export const handleParticipantSocketConnection = (participantSocket : Socket) => {
    participantSocket.emit('statusChange', lobbyService.getLobbyStatus(participantSocket['lobbyCode']))

    participantSocket.on('disconnect', () => {
        lobbyService.removeParticipantSocket(participantSocket['lobbyCode'], participantSocket.id)
    })
}

export const isParticipantMiddleware = (socket : Socket, next: (err?: ExtendedError) => void) => {
    const authToken = socket.handshake.auth.userID
    const lobbyCode = socket.handshake.auth.lobbyCode

    if (!authToken) {
        const err = new Error("Did not receive a token with the request")
        next(err)
        return
    }
    if (!lobbyCode) {
        const err = new Error("Did not receive a lobby code with the request")
        next(err)
        return
    }

    if (!lobbyService.isValidLobbyCode(lobbyCode) || !lobbyService.isParticipant(lobbyCode, authToken)) {
        const err = new Error("You do not have access to this lobby!")
        next(err)
        return
    }

    if (lobbyService.isParticipantConnected(lobbyCode, authToken)) {
        const err = new Error("Another user has already connected to this lobby with this token!")
        next(err)
        return
    }



    socket['lobbyCode'] = lobbyCode
}