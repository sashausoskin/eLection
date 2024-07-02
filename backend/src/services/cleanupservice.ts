import { LobbyCloseReason, LobbyStatusInfo } from '../types/types'
import { io } from '../util/server'
import * as lobbyService from './lobbyservice'

const defaultTimeoutDuration = Number(process.env.LOBBY_TIMEOUT_LENGTH) | 3600000

export const closeLobby = (lobbyCode : string, reason: LobbyCloseReason) => {
    const viewerSocket = lobbyService.getViewerSocket(lobbyCode)
    const participantSockets = lobbyService.getAllParticipantSockets(lobbyCode)

    const lobbyClosingMessage : LobbyStatusInfo = {status: 'CLOSING', reason}

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyClosingMessage)
    io.of('/viewer').in(viewerSocket).disconnectSockets()
    participantSockets.forEach((socket) => {
        io.of('/lobby').to(socket).emit('status-change', lobbyClosingMessage)
        io.of('/lobby').in(socket).disconnectSockets()
    })

    const lobbyTimeout = lobbyService.getInactivityTimerID(lobbyCode)
    if (lobbyTimeout) clearTimeout(lobbyTimeout)

    lobbyService.deleteLobby(lobbyCode)
}

export const updateLobbyTimeout = (lobbyCode : string, timeoutDuration? : number) => {
    const existingTimeout = lobbyService.getInactivityTimerID(lobbyCode)
    if (existingTimeout) clearTimeout(existingTimeout)

    const newTimeout = setTimeout(() => closeLobby(lobbyCode, 'INACTIVITY'), timeoutDuration ? timeoutDuration : defaultTimeoutDuration)
    lobbyService.saveInactivityTimerID(lobbyCode, newTimeout)
}