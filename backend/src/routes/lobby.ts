import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import { ErrorMessage } from '../types/types'


const router = express.Router()

router.post('/createLobby', async (req, res) => {
    const {lobbyCode, hostID} = lobbyService.createNewLobby()
    res.send({lobbyCode, hostID})
})

router.post('/joinLobby', async (req, res) => {
    if (!req.body.lobbyCode) {
        res.status(400).json({type: 'MISSING_LOBBY_CODE', message: 'The request is missing field lobbyCode'} as ErrorMessage)
        return
    }

    const lobbyCode : string = req.body.lobbyCode as string

    if (!lobbyService.isValidLobbyCode(lobbyCode)) {
        res.status(404).json({type: 'MALFORMATTED_REQUEST', message: 'No lobby was found with the given code'} as ErrorMessage)
        return
    }

    const userCode = lobbyService.getNewUserCode(lobbyCode)

    return res.send({userCode})
})

router.post('/validateUserInfo', async (req, res) => {
    const lobbyCode = req.body.lobbyCode
    const userID = req.body.userID

    if (!lobbyCode) {
        return res.status(400).json({error: 'The request is missing field lobbyCode'})
    }

    if (!userID) {
        return res.status(400).json({error: 'The request is missing field userID'})
    }

    const userIsValid = lobbyService.isParticipant(lobbyCode, userID)

    if (!userIsValid) {
        return res.status(403).json({error: 'The given information is not valid'})
    }

    return res.status(200).send()
})

router.post('/validateHostInfo', async (req, res) => {
    const lobbyCode = req.body.lobbyCode
    const hostID = req.body.hostID

    if (!lobbyCode) return res.status(400).json({error: 'Request is missing field lobbyCode'})

    if (!hostID) return res.status(400).json({error: 'Request is missing field hostID'})

    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(404).json({error: 'Could not find a lobby with the given code'})

    if (!lobbyService.isLobbyHost(lobbyCode, hostID)) return res.status(403).send()
    
    return res.status(200).send()
})

export default router