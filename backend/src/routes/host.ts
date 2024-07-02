import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import * as cleanupService from '../services/cleanupservice'
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

    const lobbyCode = req.body.lobbyCode

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

    cleanupService.updateLobbyTimeout(lobbyCode)

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

    cleanupService.updateLobbyTimeout(lobbyCode)

    return res.send()
})

router.post('/closeLobby', (req,res) => {
    const lobbyCode = req.body.lobbyCode

    closeLobby(lobbyCode, 'HOST_CLOSED')

    return res.send()
})

export default router