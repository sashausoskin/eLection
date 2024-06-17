import express from 'express'
import * as lobbyService from '../services/lobbyservice'
import { ElectionInfo, ErrorMessage } from '../types/types'
import Ajv from 'ajv'
import * as electioninfo_schema from '../types/ElectionInfo_schema.json'

const router = express.Router()

const ajv = new Ajv()

//Authorization
router.use((req, res, next) => {
    const authToken = req.headers.authorization

    if (!authToken) return res.status(401).json({type: "MISSING_AUTH_TOKEN", message: "Did not receive an authorization token with the request"} as ErrorMessage)

    const lobbyCode = req.body.lobbyCode

    if (!lobbyCode) return res.status(400).json({type: "MISSING_LOBBY_CODE", message: "Did not receive a lobby code"} as ErrorMessage)
    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(400).json({type: "UNAUTHORIZED", message: "Did not receive a valid lobby token"} as ErrorMessage)
    if (!lobbyService.isLobbyHost(lobbyCode, authToken)) return res.status(403).json({type: "UNAUTHORIZED", message: "You do not have access to this lobby!"} as ErrorMessage)

    next()
})

router.post('/createElection', (req, res) => {
    const electionInfo = req.body.electionInfo
    const lobbyCode = req.body.lobbyCode

    const valid = ajv.validate(electioninfo_schema, electionInfo)

    if (!valid) return res.status(400).send(ajv.errors)

    lobbyService.createElection(lobbyCode, electionInfo as ElectionInfo)

    return res.status(200).send()
})

export default router