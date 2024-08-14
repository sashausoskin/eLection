import { ExtendedError } from 'socket.io/dist/namespace'
import * as lobbyService from '../services/lobbyservice'
import * as socketservice from '../services/socketservice'
import { Socket } from 'socket.io'

/**
 * Checks if the user connecting to the socket is actually in the queue.
 */
export const queueSocketAuthenticationMiddleware = async (socket : Socket, next: (err?: ExtendedError) => void) => {
    const userCode = socket.handshake.auth.userCode
    const lobbyCode = socket.handshake.auth.lobbyCode

    if (!lobbyService.isValidLobbyCode(lobbyCode)) {
        const err = new Error('lobbyCode is malformatted.')
        next(err)
        return
    }

    if (!lobbyService.isUserInQueue(userCode, lobbyCode)) {
        const err = new Error('Could not find a user with the given code')
        next(err)
        return
    }

    if (socketservice.isUserConnectedToQueue(lobbyCode, userCode)) {
        const err = new Error('You have already connected to this queue!')
        next(err)
        return
    }

    socket['lobbyCode'] = lobbyCode
    socket['userCode'] = userCode

    next()
}

export const handleQueueSocketConnection = (socket: Socket) => {
    socketservice.assignSocketIdToQueueingUser(socket['userCode'], socket['lobbyCode'], socket.id)

    socket.on('disconnect', () => {
        if (!lobbyService.isValidLobbyCode(socket['lobbyCode'])) return
        if (!lobbyService.isUserInQueue(socket['userCode'], socket['lobbyCode'])) return
        lobbyService.removeUserFromQueue(socket['lobbyCode'], socket['userCode'])
    })

}