import express from 'express'
import { UserNotFound, createAuthenticatedUser, createNewLobby, getLobby, getNewUserCode, getUserSocketID, isLobbyHost,
        isValidLobbyCode, removeUserFromQueue } from '../services/lobbyservice'
import {io} from '../util/server'


const router = express.Router()

router.post('/createLobby', async (req, res) => {
    const {lobbyCode, hostID} = createNewLobby()
    res.send({lobbyCode, hostID})
})

router.post('/joinLobby', async (req, res) => {
    if (!req.body.lobbyCode) {
        res.status(400).json({error: "The request is missing field lobbyCode"})
        return
    }

    const lobbyCode : string = req.body.lobbyCode as string

    if (!isValidLobbyCode(lobbyCode)) {
        res.status(404).json({error: "No lobby was found with the given code"})
        return
    }

    const userCode = getNewUserCode(lobbyCode)

    return res.send({userCode})
})

router.post('/authenticateUser', async (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).json({error: 'Missing authorization header!'})
        return
    }

    const hostID = req.headers.authorization

    if (!req.body.lobbyCode || typeof req.body.lobbyCode !== 'string') {
        res.status(400).json({error: 'The request is missing field lobbyCode or it is malformatted'})
        return
    }

    const lobbyCode = req.body.lobbyCode

    if (!isLobbyHost(lobbyCode, hostID)) {
        res.status(401).json({error: 'You are not the host of this lobby'})
        return
    }

    if (!req.body.userCode || typeof req.body.userCode !== 'string') {
        res.status(400).json({error: 'The request is missing the field userCode or it is malformatted'})
        return
    }

    const userToAuthorize = req.body.userCode

    const userSocketID = getUserSocketID(lobbyCode, userToAuthorize)

    try {
        removeUserFromQueue(lobbyCode, userToAuthorize)
    }

    catch (e) {
        if (e instanceof UserNotFound) {
            res.status(404).json({error: 'Could not find a user with the given code'})
        }
        return
    }

    const newUserID = createAuthenticatedUser(lobbyCode)

    io.of('/queue').to(userSocketID).timeout(1000).emit('authorize', {userID: newUserID})

    res.status(200).send()
})

export default router