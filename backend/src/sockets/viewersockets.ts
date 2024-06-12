import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { getLobbyStatus, isLobbyHost, isValidLobbyCode } from "../services/lobbyservice";

export const handleViewerSocketConnection = (viewerSocket : Socket) => {
    console.log(viewerSocket.id, 'is connecting...')
    viewerSocket.emit('statusChange', getLobbyStatus(viewerSocket['lobbyCode']))

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

    if (!isValidLobbyCode(lobbyCode)) {
        console.log('Emitting error...')
        const err = new Error('Lobby does not exist')
        next(err)
        return
    }

    if (!isLobbyHost(lobbyCode, hostID)) {
        const err = new Error('You are not the host of this lobby.')
        next(err)
        return
    }
    socket['lobbyCode'] = lobbyCode

    next()
}