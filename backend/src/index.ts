import express, { Router } from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { handleQueueSocketConnection } from './sockets/lobbysockets'

const PORT : number = 3000

const lobbyRouter : Router = require('./routes/lobby')

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

app.use(cors())
app.use('/lobby', lobbyRouter)

io.of("/queue").on('connection', (socket) => {
    handleQueueSocketConnection(socket)
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})



