import express from "express"
import { getNewUserCode, isUserInQueue, isValidLobbyCode } from "../services/lobbyservice"
import { Socket } from "socket.io"

export const handleQueueSocketConnection = (socket: Socket) => {
    console.log(socket.handshake.query)
    const userCode = socket.handshake.query.userCode as string
    const lobbyCode = socket.handshake.query.lobbyCode as string
    console.log("A user joined: ", userCode)

    if (!(typeof userCode === 'string')) {
        console.log('Sending error message to', socket.id)
        socket.emit('error', "userCode is malformatted. Disconnecting...")
        socket.disconnect()
    }

    if (!(typeof lobbyCode === 'string')) {
        socket.to(socket.id).emit('error', 'lobbyCode is malformatted. Disconnecting...')
        socket.disconnect()
        return
    }

    if (!isValidLobbyCode(lobbyCode)) {
        socket.to(socket.id).emit('error', 'lobbyCode is malformatted. Disconnecting...')
        socket.disconnect()
        return
    }

    if (!isUserInQueue(userCode, lobbyCode)) {
        socket.to(socket.id).emit('error', 'userCode not found. Disconnecting...')
        socket.disconnect()
    }

    socket.join(`queue_lobby${lobbyCode}_user${userCode}`)
    console.log(`User ${userCode} was added to queue of lobby ${lobbyCode}`)
}