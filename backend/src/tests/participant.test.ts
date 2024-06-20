import request from 'supertest'
import { app } from '../util/server'
import { ElectionInfo } from '../types/types'
import * as lobbyService from '../services/lobbyservice'

let hostID : string
let participantID : string
let lobbyCode : string

describe('With an active FPTP election', () => {
    beforeEach(async () => {
        lobbyService.resetLobbies()

        const lobbyCreationRequest = await request(app).post('/testing/createLobbyWithUser')
        hostID = lobbyCreationRequest.body.hostID
        participantID = lobbyCreationRequest.body.participantID
        lobbyCode = lobbyCreationRequest.body.lobbyCode

        const exampleElection : ElectionInfo = {type: 'FPTP', title: 'Presidential election 2024', candidates: ['Donald Trump', 'Joe Biden']}

        await request(app).post('/host/createElection')
            .set('Authorization', hostID)
            .send({lobbyCode, electionInfo: exampleElection})
    })

    test('cannot vote without an authorization token', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .send({lobbyCode, voteContent: 'Joe Biden'})
        
        expect(voteCastRequest.status).toBe(401)
        expect(voteCastRequest.body.type).toBe('MISSING_AUTH_TOKEN')
    })

    test('cannot vote without a valid lobby code', async () => {
       const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', hostID)
            .send({lobbyCode: lobbyCode === '1234' ? '4321' : '1234', voteContent: 'Joe Biden'})
        
        expect(voteCastRequest.status).toBe(404)
        expect(voteCastRequest.body.type).toBe('UNAUTHORIZED') 
    })

    test('cannot vote with an invalid authorization token', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', '1111111111-111111')
            .send({lobbyCode, voteContent: 'Joe Biden'})
        
        expect(voteCastRequest.status).toBe(403)
        expect(voteCastRequest.body.type).toBe('UNAUTHORIZED') 
    })

    test('cannot vote for a person that isn\'t a candidate', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode, voteContent: 'Barack Obama'})

        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST') 
    })

    test('can vote with valid info', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode, voteContent: 'Joe Biden'})

        expect(voteCastRequest.status).toBe(200)
    })

    test('cannot vote twice', async () => {
        let voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode, voteContent: 'Joe Biden'})

        expect(voteCastRequest.status).toBe(200)

        voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode, voteContent: 'Joe Biden'})

        expect(voteCastRequest.status).toBe(403)
        expect(voteCastRequest.body.type).toBe('ALREADY_VOTED')
    })

    test('cannot vote for an array of candidates', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode, voteContent: ['Joe Biden', 'Donald Trump']})

        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST')
    })
})

describe('Without an active election', () => {
    beforeEach(async () => {
        lobbyService.resetLobbies()

        const lobbyCreationRequest = await request(app).post('/testing/createLobbyWithUser')
        hostID = lobbyCreationRequest.body.hostID
        participantID = lobbyCreationRequest.body.participantID
        lobbyCode = lobbyCreationRequest.body.lobbyCode
    })

    test('cannot vote',  async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
        .set('Authorization', participantID)
        .send({lobbyCode, voteContent: 'Joe Biden'})

        expect(voteCastRequest.status).toBe(405)
        expect(voteCastRequest.body.type).toBe('NO_ACTIVE_ELECTION')
    })
})