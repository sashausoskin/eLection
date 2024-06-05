import express from 'express'
import { createNewLobby, getNewUserCode, isValidLobbyCode } from '../services/lobbyservice'


const router = express.Router()

router.post('/createLobby', async (req, res) => {
    const {lobbyCode, hostID} = createNewLobby()

    console.log("Sending lobby code", lobbyCode)
    res.send({lobbyCode, hostID})
})

router.get('/joinLobby/:lobbyCode', async (req, res) => {
    console.log(typeof req.params.lobbyCode)
    if (!req.params["lobbyCode"]) {
        res.status(400).send({error: "The request is missing field lobbyCode"})
        return
    }

    const lobbyCode : string = req.params.lobbyCode

    if (!isValidLobbyCode(lobbyCode)) {
        res.status(404).json({error: "No lobby was found with the given code"})
        return
    }

    const userCode = getNewUserCode(lobbyCode)

    res.send({userCode})

    return
})

module.exports = router