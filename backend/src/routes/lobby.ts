import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import { AuthenticationObject, ErrorMessage } from '../types/communicationTypes'
import { decodeObject } from '../util/encryption'


const router = express.Router()

router.post('/createLobby', async (_req, res) => {
    const {lobbyCode, hostID} = lobbyService.createNewLobby()
    res.send({lobbyCode, hostID})
})

router.post('/joinLobby', async (req, res) => {
    if (!req.body.lobbyCode) {
        res.status(400).json({type: 'MISSING_LOBBY_CODE', message: 'The request is missing field lobbyCode'} as ErrorMessage)
        return
    }

    const lobbyCode = req.body.lobbyCode as string

    if (!lobbyService.isValidLobbyCode(lobbyCode)) {
        res.status(404).json({type: 'MALFORMATTED_REQUEST', message: 'No lobby was found with the given code'} as ErrorMessage)
        return
    }

    const userCode = lobbyService.getNewUserCode(lobbyCode)

    return res.send({userCode})
})

router.post('/validateUserInfo', async (req, res) => {
    const authToken = req.headers.authorization
    if (!authToken) return res.status(400).json({error: 'No authentication header'})
    let decodedAuthToken
    try {
        decodedAuthToken = decodeObject(authToken.substring(7)) as AuthenticationObject
    } catch {
        return res.status(403).json({error: 'Invalid authentication token'})
    }


    const lobbyCode = decodedAuthToken.lobbyCode
    const userID = decodedAuthToken.id

    const userIsValid = lobbyService.isParticipant(lobbyCode, userID)

    if (!userIsValid) {
        return res.status(403).json({error: 'The given information is not valid'})
    }

    return res.status(200).send()
})

router.post('/validateHostInfo', async (req, res) => {
    const lobbyCode = req.body.lobbyCode
    const hostID = req.body.hostID

    if (!lobbyCode) return res.status(400).json({type: 'MALFORMATTED_REQUEST',message: 'Request is missing field lobbyCode'} as ErrorMessage)
    if (!hostID) return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'Request is missing field hostID'} as ErrorMessage)

    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(404).json({type: 'NOT_FOUND', message: 'Could not find a lobby with the given code'} as ErrorMessage)

    if (!lobbyService.isLobbyHost(lobbyCode, hostID)) return res.status(403).send({type: 'UNAUTHORIZED', message: 'You are not the host of this lobby.'} as ErrorMessage)
    
    return res.status(200).send()
})

export default router