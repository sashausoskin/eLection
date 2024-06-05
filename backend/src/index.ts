import express, { Router } from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { handleQueueSocketConnection } from './sockets/lobbysockets'
import { app, io, server } from './util/server'

const PORT : number = 3000

const lobbyRouter : Router = require('./routes/lobby')



app.use(cors())
app.use(express.json())
app.use('/lobby', lobbyRouter)

io.of("/queue").on('connection', (socket) => {
    handleQueueSocketConnection(socket)
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})



