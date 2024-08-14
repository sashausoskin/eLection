import { LobbyCloseReason, LobbyStatusInfo } from '../types/lobbyTypes'
import { io } from '../util/server'
import * as lobbyService from './lobbyservice'
import * as socketservice from './socketservice'

const defaultTimeoutDuration = (process.env.LOBBY_TIMEOUT_LENGTH && Number(process.env.LOBBY_TIMEOUT_LENGTH)) | 7200000

/**
 * First sends a message to the participants and the viewer that the lobby is closing, then deletes the lobby.
 * @param lobbyCode The code of the lobby which will be closed.
 * @param reason The reason why the lobby is closing down. See {@link LobbyCloseReason}
 */
export const closeLobby = (lobbyCode : string, reason: LobbyCloseReason) => {
    const viewerSocket = socketservice.getViewerSocket(lobbyCode)
    const participantSockets = socketservice.getAllParticipantSockets(lobbyCode)

    const lobbyClosingMessage : LobbyStatusInfo = {status: 'CLOSING', reason}

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyClosingMessage)
    io.of('/viewer').in(viewerSocket).disconnectSockets(true)
    participantSockets.forEach((socket) => {
        io.of('/lobby').to(socket).emit('status-change', lobbyClosingMessage)
        io.of('/lobby').in(socket).disconnectSockets(true)
    })

    lobbyService.deleteLobby(lobbyCode)
}
/**
 * A routine that goes through all of the open lobbies and closes down the ones that have been open for too long.
 */
export const cleanupRoutine = () => {
    console.log('Performing cleanup')
    const activityArray = lobbyService.getAllLobbyActivity()

    activityArray.forEach((lobby) => {
        if (Date.now() - lobby.lastActivity >= defaultTimeoutDuration) {
            closeLobby(lobby.lobbyCode, 'INACTIVITY')
        }
    })
}