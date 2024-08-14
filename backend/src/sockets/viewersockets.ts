import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import * as lobbyService from '../services/lobbyservice'
import * as socketservice from '../services/socketservice'
import { io } from '../util/server'

export const getAuthenticationMiddleware = (socket : Socket, next: (err?: ExtendedError) => void) => {
    const lobbyCode = socket.handshake.auth.lobbyCode
    const hostID = socket.handshake.auth.hostID

    if (!lobbyCode || !hostID) {
        const err = new Error('Did not receive required authentication info')
        next(err)
        return
    }

    if (!lobbyService.isValidLobbyCode(lobbyCode)) {
        const err = new Error('Lobby does not exist')
        next(err)
        return
    }

    if (!lobbyService.isLobbyHost(lobbyCode, hostID)) {
        const err = new Error('You are not the host of this lobby.')
        next(err)
        return
    }

    socket['lobbyCode'] = lobbyCode

    const existingViewerSocket = socketservice.getViewerSocket(lobbyCode)

    if (existingViewerSocket) io.of('/viewer').in(existingViewerSocket).disconnectSockets(false)

    socketservice.assignViewerSocket(lobbyCode, socket.id)

    next()
}

export const handleViewerSocketConnection = (viewerSocket : Socket) => {
    const lobbyCode = viewerSocket['lobbyCode']

    viewerSocket.emit('status-change', lobbyService.getLobbyStatus(lobbyCode, true))
    viewerSocket.emit('user-joined', lobbyService.getParticipants(lobbyCode).length)
    if (lobbyService.isElectionActive(lobbyCode)) viewerSocket.emit('vote-casted', lobbyService.getNumberOfVotes(lobbyCode))

    viewerSocket.on('disconnect', () => {
        if (!lobbyService.isValidLobbyCode(viewerSocket['lobbyCode'])) return
        socketservice.removeViewerSocket(viewerSocket['lobbyCode'])
    })
}

