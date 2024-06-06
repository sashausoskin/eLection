import express from "express"
import { assignSocketIdToUser, getLobby, getNewUserCode, getUsersInQueue, isUserInQueue, isValidLobbyCode } from "../services/lobbyservice"
import { Socket } from "socket.io"

export const handleQueueSocketConnection = (socket: Socket) => {
    const userCode = socket.handshake.query.userCode as string
    const lobbyCode = socket.handshake.query.lobbyCode as string

    if (!(typeof userCode === 'string')) {
        socket.emit('error', "userCode is malformatted. Disconnecting...")
        socket.disconnect()
        return
    }

    if (!(typeof lobbyCode === 'string')) {
        socket.emit('error', 'lobbyCode is malformatted. Disconnecting...')
        socket.disconnect()
        return
    }

    if (!isValidLobbyCode(lobbyCode)) {
        socket.emit('error', 'lobbyCode is malformatted. Disconnecting...')
        socket.disconnect()
        return
    }

    if (!isUserInQueue(userCode, lobbyCode)) {
        socket.emit('error', 'userCode not found. Disconnecting...')
        socket.disconnect()
        return
    }

    try {
        assignSocketIdToUser(userCode, lobbyCode, socket.id)
    }
    catch (e) {
        if (e instanceof Error) {
            socket.emit('error', e.message)
            socket.disconnect()
            return
        }
    }
}