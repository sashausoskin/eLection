import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { handleQueueSocketConnection, queueSocketAuthenticationMiddleware } from '../sockets/queuesockets'
import { getAuthenticationMiddleware, handleViewerSocketConnection } from '../sockets/viewersockets'
import { handleParticipantSocketConnection, isParticipantMiddleware } from '../sockets/lobbysockets'
import lobbyRouter from '../routes/lobby'
import testingRouter from '../routes/testing'
import hostRouter from '../routes/host'
import participantRouter from '../routes/participant'
import rateLimit from 'express-rate-limit'


dotenv.config()

export const app = express()
export const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test' ? '*' : process.env.CORS_ORIGIN // If server is not running in production mode, allow requests from everywhere.
    }
})

const limiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 150,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: () => process.env.NODE_ENV === 'test'
})

app.use(cors())
app.use(express.json())
app.use(limiter)
app.use('/lobby', lobbyRouter)
app.use('/host', hostRouter)
app.use('/participant', participantRouter)
app.get('/ping', (_req, res) => {
    return res.send('pong')
})

if (process.env.NODE_ENV === 'test') app.use('/testing', testingRouter)

io.of('/queue').use(queueSocketAuthenticationMiddleware)
io.of('/queue').on('connection', handleQueueSocketConnection)

io.of('/viewer').use(getAuthenticationMiddleware)
io.of('/viewer').on('connection', handleViewerSocketConnection)

io.of('/lobby').use(isParticipantMiddleware)
io.of('/lobby').on('connection', handleParticipantSocketConnection)

app.set('trust proxy', process.env.PROXY_TRUST_DEPTH || 1)

