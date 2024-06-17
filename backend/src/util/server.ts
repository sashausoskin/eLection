import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleQueueSocketConnection } from '../sockets/queuesockets'
import * as dotenv from 'dotenv'

import lobbyRouter from '../routes/lobby'
import testingRouter from '../routes/testing'
import hostRouter from '../routes/host'
import { getAuthenticationMiddleware, handleViewerSocketConnection } from '../sockets/viewersockets'
import { handleParticipantSocketConnection, isParticipantMiddleware } from '../sockets/lobbysockets'

dotenv.config()

export const app = express()
export const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN
    }
})

app.use(cors())
app.use(express.json())
app.use('/lobby', lobbyRouter)
app.use('/host', hostRouter)

if (process.env.NODE_ENV === 'test') app.use('/testing', testingRouter)

io.of('/queue').on('connection', (socket) => {
    handleQueueSocketConnection(socket)
})

io.of('/viewer').use((socket, next) => {
    getAuthenticationMiddleware(socket, next)
})

io.of('/viewer').on('connection', (socket) => {
    handleViewerSocketConnection(socket)
} )

io.of('/lobby').use((socket, next) => {
    isParticipantMiddleware(socket, next)
})

io.of('/lobby').on('connection', (socket) => {
    handleParticipantSocketConnection(socket)
})