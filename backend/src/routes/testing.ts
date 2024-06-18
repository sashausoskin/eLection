import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import { LobbyWithUserCreationResponse } from '../types/testTypes'

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

export default router