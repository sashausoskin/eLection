import express from 'express'
import { createNewLobby } from '../services/lobbyservice'


const router = express.Router()

router.post('/createLobby', async (req, res) => {
    const {lobbyCode, hostID} = createNewLobby()

    console.log("Sending lobby code", lobbyCode)
    res.send({lobbyCode, hostID})
})

module.exports = router