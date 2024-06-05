import { instrument } from '@socket.io/admin-ui'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

export const app = express()
export const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})