import express from 'express'
import * as lobbyService from '../services/lobbyservice'

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

export default router