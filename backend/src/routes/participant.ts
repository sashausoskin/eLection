import express from 'express'
import { ErrorMessage } from '../types/types'
import * as lobbyService from '../services/lobbyservice'
import { io } from '../util/server'

const router = express.Router()

router.use((req, res, next) => {
    const authToken = req.headers.authorization

    if (!authToken) {
        return res.status(401).send({type: 'MISSING_AUTH_TOKEN', message: 'Did not receive an authorization token with the request'} as ErrorMessage)
    }

    const lobbyCode = req.body.lobbyCode

    if (!lobbyCode) return res.status(400).json({type: 'MISSING_LOBBY_CODE', message: 'Did not receive a lobby code'} as ErrorMessage)
    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(404).json({type: 'UNAUTHORIZED', message: 'Did not receive a valid lobby token'} as ErrorMessage)
    if (!lobbyService.isParticipant(lobbyCode, authToken)) return res.status(403).json({type: 'UNAUTHORIZED', message: 'You are not a participant in this lobby!'} as ErrorMessage)
    
    next()
})

router.post('/castVote', (req, res) => {
    const lobbyCode = req.body.lobbyCode
    const currentLobbyStatus = lobbyService.getLobbyStatus(lobbyCode)

    if (currentLobbyStatus.status !== 'VOTING') {
        return res.status(405).send({type: 'NO_ACTIVE_ELECTION', message: 'You casted a vote even though there isn\'t an election going on.'} as ErrorMessage)
    }

    if (lobbyService.hasUserVoted(lobbyCode, req.headers.authorization)) {
        return res.status(403).send({type: 'ALREADY_VOTED', message: 'You have already casted a vote in this election'} as ErrorMessage)
    }

    const voteContent : string | string[] = req.body.voteContent

    if (voteContent === undefined) return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: 'Did not receive voteContent with the request'} as ErrorMessage)

    const currentElectionType = currentLobbyStatus.electionInfo.type

    if (voteContent !== null){
        switch (currentElectionType) {
            case 'FPTP':
                if (Array.isArray(voteContent)) {
                    return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: 'Received an array for a FPTP election, where you can only vote for a single candidate'} as ErrorMessage)
                }
                else if (!lobbyService.isValidVote(lobbyCode, voteContent)) {
                    return res.status(400).send({type: 'MALFORMATTED_REQUEST', message: 'Casted a vote for someone or something that isn\'t a candidate'} as ErrorMessage)
                }

                lobbyService.castVotes(lobbyCode, voteContent, 1)
        }
    }
    else lobbyService.castVotes(lobbyCode, null, 1)

    const usersVoted = lobbyService.saveUserVoted(lobbyCode, req.headers.authorization)

    io.of('/viewer').to(lobbyService.getViewerSocket(lobbyCode)).emit('vote-casted', usersVoted)

    return res.status(200).send()
})

export default router