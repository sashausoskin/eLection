import express, { Router } from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleQueueSocketConnection } from '../sockets/lobbysockets'

export const app = express()
export const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

const lobbyRouter : Router = require('../routes/lobby')

app.use(cors())
app.use(express.json())
app.use('/lobby', lobbyRouter)

io.of("/queue").on('connection', (socket) => {
    handleQueueSocketConnection(socket)
})