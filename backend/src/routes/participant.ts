import express from 'express'
import { ErrorMessage } from '../types/communicationTypes'
import * as lobbyService from '../services/lobbyservice'
import { io } from '../util/server'

const router = express.Router()

// Check the authorization of the participant
router.use((req, res, next) => {
    const authToken = req.headers.authorization

    if (!authToken) {
        return res.status(401).json({type: 'MISSING_AUTH_TOKEN', message: 'Did not receive an authorization token with the request'} as ErrorMessage)
    }

    const lobbyCode = req.body.lobbyCode

    if (!lobbyCode) return res.status(400).json({type: 'MISSING_LOBBY_CODE', message: 'Did not receive a lobby code'} as ErrorMessage)
    if (!lobbyService.isValidLobbyCode(lobbyCode)) return res.status(404).json({type: 'UNAUTHORIZED', message: 'Did not receive a valid lobby token'} as ErrorMessage)
    if (!lobbyService.isParticipant(lobbyCode, authToken)) return res.status(403).json({type: 'UNAUTHORIZED', message: 'You are not a participant in this lobby!'} as ErrorMessage)
    
    next()
})

router.post('/castVote', (req, res) => {
    const lobbyCode = req.body.lobbyCode
    const currentLobbyStatus = lobbyService.getLobbyStatus(lobbyCode, false)

    if (currentLobbyStatus.status !== 'VOTING') {
        return res.status(405).json({type: 'NO_ACTIVE_ELECTION', message: 'You casted a vote even though there isn\'t an election going on.'} as ErrorMessage)
    }

    if (lobbyService.hasUserVoted(lobbyCode, req.headers.authorization)) {
        return res.status(403).json({type: 'ALREADY_VOTED', message: 'You have already casted a vote in this election'} as ErrorMessage)
    }

    const voteContent : string | string[] = req.body.voteContent

    if (voteContent === undefined) return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'Did not receive voteContent with the request'} as ErrorMessage)

    const currentElectionType = currentLobbyStatus.electionInfo.type

    if (voteContent !== null){
        switch (currentElectionType) {
            case 'FPTP':
                if (Array.isArray(voteContent)) {
                    return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'Received an array for a FPTP election, where you can only vote for a single candidate'} as ErrorMessage)
                }
                else if (!lobbyService.isValidCandidate(lobbyCode, voteContent)) {
                    return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'Casted a vote for someone or something that isn\'t a candidate'} as ErrorMessage)
                }

                lobbyService.castVotes(lobbyCode, voteContent, 1)
                break
            case 'ranked':
                if (!Array.isArray(voteContent)) {
                    return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'Casted a vote for a single candidate while expecting an array of candidates.'} as ErrorMessage)
                }
                if (voteContent.length !== currentLobbyStatus.electionInfo.candidatesToRank) {
                    return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: `Casted votes for ${voteContent.length} candidates, while expecting ${currentLobbyStatus.electionInfo.candidatesToRank} candidates`} as ErrorMessage)
                }
                voteContent.forEach((candidate) => {
                    if (!lobbyService.isValidCandidate(lobbyCode, candidate)) {
                        return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: `${candidate} is not a candidate in this election`} as ErrorMessage)
                    }
                })

                if (voteContent.length !== new Set(voteContent).size) {
                    return res.status(400).json({type: 'MALFORMATTED_REQUEST', message: 'You can give only one rank to a candidate.'} as ErrorMessage)
                }

                voteContent.forEach((candidate, index) => {
                    lobbyService.castVotes(lobbyCode, candidate, voteContent.length - index)
                })

        }
    }
    else lobbyService.castVotes(lobbyCode, null, 1)

    const usersVoted = lobbyService.saveUserVoted(lobbyCode, req.headers.authorization)

    io.of('/viewer').to(lobbyService.getViewerSocket(lobbyCode)).emit('vote-casted', usersVoted)

    return res.status(200).send()
})

export default router