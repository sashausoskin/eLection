import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import { cleanupRoutine } from '../services/cleanupservice'

const router = express.Router()

router.post('/reset', (req, res) => {
    lobbyService.resetLobbies()
    res.status(200).send()
})

router.get('/getParticipants', (req, res) => {
    const lobbyCode = req.body.lobbyCode

    if (!lobbyCode) return res.status(400).send({'error': 'Body is missing parameter lobbyCode'})

    return res.send(lobbyService.getParticipants(req.body.lobbyCode))
})

router.post<LobbyWithUserCreationResponse>('/createLobbyWithUser', (req, res) => {
    const {lobbyCode, hostID} = lobbyService.createNewLobby()
    const participantID = lobbyService.createAuthenticatedUser(lobbyCode)

    res.json({lobbyCode, hostID, participantID})
})

router.post('/createUser', (req, res) => {
    const lobbyCode = req.body.lobbyCode

    if (!lobbyCode) return res.status(400).send()

    const participantID = lobbyService.createAuthenticatedUser(lobbyCode)

    return res.json({participantID})
})

router.get('/getElectionResults', (req, res) => {
    const lobbyCode = req.body.lobbyCode

    if (!lobbyCode) return res.status(400).send

    return res.json(lobbyService.getElectionVotes(lobbyCode))
})

router.post('/forceServerCleanup', (req, res) => {
    cleanupRoutine()

    return res.send()
})

router.post('/setLobbyLastActive', (req, res) => {
    const lobbyCode = req.body.lobbyCode
    const lastActiveTime = req.body.lastActiveTime

    if (!lobbyCode || !lastActiveTime) return res.status(400).send()

    lobbyService.updateLastActivity(lobbyCode, lastActiveTime)

    res.send()
})

router.get('/getNumberOfLobbies', (req, res) => {
    return res.status(200).send({numberOfLobbies: lobbyService.getNumberOfLobbies()})
})

export default router