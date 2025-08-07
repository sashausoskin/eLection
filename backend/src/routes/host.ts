import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import * as socketservice from '../services/socketservice'
import { AuthenticationObject, ErrorMessage } from '../types/communicationTypes'
import { ElectionInfo } from '../types/lobbyTypes'
import { LobbyStatusInfo } from '../types/lobbyTypes'
import Ajv from 'ajv'
import * as electioninfo_schema from '../types/ElectionInfo_schema.json'
import { io } from '../util/server'
import * as cleanupService from '../services/cleanupservice'
import { decodeObject, encodeObject } from '../util/encryption'

const router = express.Router()

const ajv = new Ajv()

//Check that the person sending the request is actually the host.
router.use((req, res, next) => {
    const authToken = req.headers.authorization

    if (!authToken) {
        return res.status(401).json({type: 'MISSING_AUTH_TOKEN', message: 'Did not receive an authorization token with the request'} as ErrorMessage)
    }

    let hostAuth
    try {
        hostAuth = decodeObject(req.headers.authorization.substring(7)) as AuthenticationObject
    } catch {
        return res.status(403).json({type: 'UNAUTHORIZED', message: 'Received an invalid authentication token'} as ErrorMessage)
    }
    

    const lobbyCode = hostAuth.lobbyCode
    const hostID = hostAuth.id

    if (!lobbyCode) return res.status(400).json({type: 'MISSING_LOBBY_CODE', message: 'Did not receive a lobby code'} as ErrorMessage)
    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(404).json({type: 'UNAUTHORIZED', message: 'Did not receive a valid lobby code'} as ErrorMessage)
    if (!lobbyService.isLobbyHost(lobbyCode, hostID)) return res.status(403).json({type: 'UNAUTHORIZED', message: 'You do not have access to this lobby!'} as ErrorMessage)

    req['lobbyCode'] = lobbyCode
    req['hostID'] = hostID

    next()
})

router.post('/createElection', (req, res) => {
    const electionInfo = req.body.electionInfo as ElectionInfo
    const lobbyCode = req['lobbyCode']

    const maxCandidateNameLength = 40

    const valid = ajv.validate(electioninfo_schema, electionInfo)

    if (!valid) {
        let errors = ''

        ajv.errors.forEach((error) => {
            errors += error.message
        })

        return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: errors} as ErrorMessage)
    }

    // This cannot be done with a JSON schema, so make sure that all of the candidate names aren't too long
    electionInfo.candidates.forEach((candidate) => {
        if (candidate.length > maxCandidateNameLength) {
            return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: `The candidate name ${candidate} is too long. Make sure that it is not longer than ${maxCandidateNameLength} characters`} as ErrorMessage)
        }
    })

    if (electionInfo.type === 'ranked') {
        // This cannot be validated with ajv, so validate manually that the candidatesToRank is not bigger than the amount of candidates.
        if (electionInfo.candidates.length < electionInfo.candidatesToRank) {
            return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: 'You cannot rank more candidates than there are candidates.'} as ErrorMessage)
        }
    }

    lobbyService.createElection(lobbyCode, electionInfo)

    socketservice.getAllParticipantSockets(lobbyCode).forEach(socket => {
        if (socket) io.of('/lobby').to(socket).emit('status-change', lobbyService.getLobbyStatus(lobbyCode, false))
    })

    const viewerSocket = socketservice.getViewerSocket(lobbyCode)

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyService.getLobbyStatus(lobbyCode, true))
    io.of('/viewer').to(viewerSocket).emit('vote-casted', 0)

    lobbyService.updateLastActivity(lobbyCode)

    return res.status(200).send()
})

router.post('/endElection', (req,res) => {
    const lobbyCode = req['lobbyCode']

    if (!lobbyService.isElectionActive(lobbyCode)) {
        return res.status(405).json({type: 'NO_ACTIVE_ELECTION', message: 'There isn\'t currently an active election going on in this lobby!'} as ErrorMessage)
    }

    lobbyService.endElection(lobbyCode)

    socketservice.getAllParticipantSockets(lobbyCode).forEach((socket) => {
        io.of('/lobby').to(socket).emit('status-change', {status:'ELECTION_ENDED' } as LobbyStatusInfo)
    })

    const lobbyStatus = lobbyService.getLobbyStatus(lobbyCode, true)
    const viewerSocket = socketservice.getViewerSocket(lobbyCode)

    io.of('/viewer').to(viewerSocket).emit('status-change', lobbyStatus)

    lobbyService.updateLastActivity(lobbyCode)

    return res.send()
})

router.get('/getElectionResults', (req, res) => {
    const lobbyCode = req['lobbyCode']

    const lobbyStatus = lobbyService.getLobbyStatus(lobbyCode, true)

    if (lobbyStatus.status !== 'ELECTION_ENDED') {
        return res.status(400).json({type: 'NO_ACTIVE_ELECTION', message: 'There was no election to fetch results for'} as ErrorMessage)
    }

    return res.json(lobbyStatus.results)
})

router.post('/closeLobby', (req,res) => {
    const lobbyCode = req['lobbyCode']

    cleanupService.closeLobby(lobbyCode, 'HOST_CLOSED')

    return res.send()
})

router.get('/getElectionStatus', (req, res) => {
    const lobbyCode = req['lobbyCode']

    return res.json({electionActive: lobbyService.isElectionActive(lobbyCode), resultsAvailable: lobbyService.areResultsAvailable(lobbyCode)})
})

router.post('/authenticateUser', async (req, res) => {
    const lobbyCode = req['lobbyCode']
    const userToAuthorize = req.body.userCode

    if (!userToAuthorize || typeof userToAuthorize !== 'string') {
        return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'The request is missing the field userCode or it is malformatted'} as ErrorMessage)
    }

    if (!lobbyService.isUserInQueue(userToAuthorize, lobbyCode)) {
        res.status(404).json({type: 'NOT_FOUND', message: 'Could not find a user with the given code'} as ErrorMessage)
        return
    }

    const userSocketID = socketservice.getUserSocketID(lobbyCode, userToAuthorize)

    lobbyService.removeUserFromQueue(lobbyCode, userToAuthorize)


    const newUserAuth = {
        id: lobbyService.createAuthenticatedUser(lobbyCode),
        lobbyCode
    }
    const viewerSocket = socketservice.getViewerSocket(lobbyCode)

    const encodedUserAuth = encodeObject(newUserAuth)

    if (viewerSocket) io.of('/viewer').to(viewerSocket).emit('user-joined', lobbyService.getParticipants(lobbyCode).length)
    io.of('/queue').to(userSocketID).emit('authorize', encodedUserAuth)

    return res.status(200).send()
})

export default router