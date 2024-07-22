import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import { ElectionInfo, ErrorMessage, LobbyStatusInfo } from '../types/types'
import Ajv from 'ajv'
import * as electioninfo_schema from '../types/ElectionInfo_schema.json'
import { io } from '../util/server'
import { closeLobby } from '../services/cleanupservice'

const router = express.Router()

const ajv = new Ajv()

//Authorization
router.use((req, res, next) => {
    const authToken = req.headers.authorization

    if (!authToken) return res.status(401).json({type: 'MISSING_AUTH_TOKEN', message: 'Did not receive an authorization token with the request'} as ErrorMessage)

    const lobbyCode = req.body.lobbyCode || req.query.lobbyCode

    if (!lobbyCode) return res.status(400).json({type: 'MISSING_LOBBY_CODE', message: 'Did not receive a lobby code'} as ErrorMessage)
    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(404).json({type: 'UNAUTHORIZED', message: 'Did not receive a valid lobby code'} as ErrorMessage)
    if (!lobbyService.isLobbyHost(lobbyCode, authToken)) return res.status(403).json({type: 'UNAUTHORIZED', message: 'You do not have access to this lobby!'} as ErrorMessage)

    next()
})

router.post('/createElection', (req, res) => {
    const electionInfo = req.body.electionInfo as ElectionInfo
    const lobbyCode = req.body.lobbyCode

    const valid = ajv.validate(electioninfo_schema, electionInfo)

    if (!valid) return res.status(400).send(ajv.errors)

    if (electionInfo.type === 'ranked') {
        // This cannot be validated with ajv, so validate manually that the candidatesToRank is not bigger than the amount of candidates.
        if (electionInfo.candidates.length < electionInfo.candidatesToRank) {
            return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: 'You cannot rank more candidates than there are candidates.'} as ErrorMessage)
        }
    }

    lobbyService.createElection(lobbyCode, electionInfo)

    lobbyService.getAllParticipantSockets(lobbyCode).forEach(socket => {
        if (socket) io.of('/lobby').to(socket).emit('status-change', lobbyService.getLobbyStatus(lobbyCode, true))
    })

    const viewerSocket = lobbyService.getViewerSocket(lobbyCode)

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyService.getLobbyStatus(lobbyCode, true))
    io.of('/viewer').to(viewerSocket).emit('vote-casted', 0)

    lobbyService.updateLastActivity(lobbyCode)

    return res.status(200).send()
})

router.post('/endElection', (req,res) => {
    const lobbyCode = req.body.lobbyCode

    if (!lobbyService.isElectionActive(lobbyCode)) {
        return res.status(405).json({type: 'NO_ACTIVE_ELECTION', message: 'There isn\'t currently an active election going on in this lobby!'} as ErrorMessage)
    }

    lobbyService.endElection(lobbyCode)

    lobbyService.getAllParticipantSockets(lobbyCode).forEach((socket) => {
        io.of('/lobby').to(socket).emit('status-change', {status:'ELECTION_ENDED' } as LobbyStatusInfo)
    })

    const lobbyStatus = lobbyService.getLobbyStatus(lobbyCode, true)
    const viewerSocket = lobbyService.getViewerSocket(lobbyCode)

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyStatus)

    lobbyService.updateLastActivity(lobbyCode)

    return res.send()
})

router.post('/closeLobby', (req,res) => {
    const lobbyCode = req.body.lobbyCode

    closeLobby(lobbyCode, 'HOST_CLOSED')

    return res.send()
})

router.get('/getElectionStatus', (req, res) => {
    const lobbyCode = req.query.lobbyCode as string

    if ((typeof lobbyCode) !== 'string' || Array.isArray(lobbyCode)) return res.json({type: 'MALFORMATTED_REQUEST', message: 'Expected a lobby code in string format'} as ErrorMessage)

    return res.json({electionActive: lobbyService.isElectionActive(lobbyCode)})
})

router.post('/authenticateUser', async (req, res) => {
    const lobbyCode = req.body.lobbyCode

    if (!req.body.userCode || typeof req.body.userCode !== 'string') {
        res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'The request is missing the field userCode or it is malformatted'} as ErrorMessage)
        return
    }

    const userToAuthorize = req.body.userCode

    if (!lobbyService.isUserInQueue(userToAuthorize, lobbyCode)) {
        res.status(404).json({type: 'NOT_FOUND', message: 'Could not find a user with the given code'} as ErrorMessage)
        return
    }

    const userSocketID = lobbyService.getUserSocketID(lobbyCode, userToAuthorize)


    lobbyService.removeUserFromQueue(lobbyCode, userToAuthorize)


    const newUserID = lobbyService.createAuthenticatedUser(lobbyCode)

    const viewerSocket = lobbyService.getViewerSocket(lobbyCode)

    if (viewerSocket) io.of('/viewer').to(viewerSocket).emit('user-joined', lobbyService.getParticipants(lobbyCode).length)
    io.of('/queue').to(userSocketID).emit('authorize', {userID: newUserID})

    res.status(200).send()
})

export default router