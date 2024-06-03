import express from "express"
import { getNewUserCode, isValidLobbyCode } from "../services/lobbyservice"
import { Socket } from "socket.io"

const router = express.Router()

export const handleJoinSocketConnection = (socket: Socket) => {
    console.log("A user connected")
    socket.on('connect to lobby', (lobbyCode, callback) => {
        if (!isValidLobbyCode(lobbyCode)) {
            socket.disconnect()
            return
        }
        if (!callback) {
            socket.disconnect()
            return
        }
        const userCode = getNewUserCode(lobbyCode)
        socket.join(`lobby${lobbyCode}_user${userCode}`)
        callback({
            userCode
        })
    })
}