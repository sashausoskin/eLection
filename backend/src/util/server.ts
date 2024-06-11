import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleQueueSocketConnection } from '../sockets/lobbysockets'
import * as dotenv from 'dotenv'

import lobbyRouter from '../routes/lobby'
import testingRouter from '../routes/testing'

dotenv.config()
console.log(process.env.CORS_ORIGIN)

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

if (process.env.NODE_ENV === 'test') app.use('/testing', testingRouter)

app.use('/', express.static('dist'))

io.of('/queue').on('connection', (socket) => {
    handleQueueSocketConnection(socket)
})