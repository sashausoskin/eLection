import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleQueueSocketConnection, queueSocketAuthenticationMiddleware } from '../sockets/queuesockets'
import * as dotenv from 'dotenv'

import lobbyRouter from '../routes/lobby'
import testingRouter from '../routes/testing'
import hostRouter from '../routes/host'
import participantRouter from '../routes/participant'
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
app.use('/participant', participantRouter)

if (process.env.NODE_ENV === 'test') app.use('/testing', testingRouter)

io.of('/queue').use(queueSocketAuthenticationMiddleware)

io.of('/queue').on('connection', handleQueueSocketConnection)

io.of('/viewer').use(getAuthenticationMiddleware)

io.of('/viewer').on('connection', handleViewerSocketConnection)

io.of('/lobby').use(isParticipantMiddleware)

io.of('/lobby').on('connection', handleParticipantSocketConnection)

