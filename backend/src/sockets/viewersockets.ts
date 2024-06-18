import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import * as lobbyService from "../services/lobbyservice";
import { io } from "../util/server";

export const handleViewerSocketConnection = (viewerSocket : Socket) => {
    const existingViewerSocket = lobbyService.getViewerSocket(viewerSocket['lobbyCode'])

    if (existingViewerSocket) io.of('/queue').in(existingViewerSocket).disconnectSockets(true)

    lobbyService.assignViewerSocket(viewerSocket['lobbyCode'], viewerSocket.id)

    viewerSocket.emit('status-change', lobbyService.getLobbyStatus(viewerSocket['lobbyCode']))

    viewerSocket.on('disconnect', () => {
        console.log(viewerSocket.id, "disconnected...")
    })
}

export const getAuthenticationMiddleware = (socket : Socket, next: (err?: ExtendedError) => void) => {
    const lobbyCode = socket.handshake.auth.lobbyCode
    const hostID = socket.handshake.auth.hostID

    if (!lobbyCode || !hostID) {
        const err = new Error("Did not receive required authentication info")
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

    next()
}