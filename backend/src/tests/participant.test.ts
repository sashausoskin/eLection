import request from 'supertest'
import { app, server } from '../util/server'
import { ElectionInfo, LobbyStatusInfo } from '../types/types'
import * as lobbyService from '../services/lobbyservice'
import { Socket, io } from 'socket.io-client'
import * as dateMock from 'jest-date-mock'
import { cleanupRoutine } from '../services/cleanupservice'

let hostID : string
let participantID : string
let lobbyCode : string
let lobbySocket : Socket

const exampleFPTPElection : ElectionInfo = {type: 'FPTP', title: 'Presidential election 2024', candidates: ['Donald Trump', 'Joe Biden']}
const exampleRankedElection : ElectionInfo = {type: 'ranked', title: 'Where should the Finnish capital be moved?', candidates: ['Tampere', 'Turku', 'Oulu'], candidatesToRank: 2}

beforeEach(() => {
    dateMock.clear()
})

beforeAll((done) => {
    server.listen(3000, () => {
        done()
    })
})

afterEach(() => {
    if (lobbySocket) lobbySocket.close()
})

afterAll(() => {
    server.close()
})

const createElection = async (electionInfo : ElectionInfo) => {
    return await request(app).post('/host/createElection')
                .set('Authorization', hostID)
                .send({lobbyCode, electionInfo})
                // I don't know why, but removing then() breaks this test. I am incredibly confused...
                .then()
}

const endElection = async () => {
    return await request(app).post('/host/endElection')
                .set('Authorization', hostID)
                .send({lobbyCode})
                .then()
}

const connectToParticipantSocket = () : Socket => {
    return io('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
}

beforeEach(async () => {
    lobbyService.resetLobbies()

    const lobbyCreationRequest = await request(app).post('/testing/createLobbyWithUser')
    hostID = lobbyCreationRequest.body.hostID
    participantID = lobbyCreationRequest.body.participantID
    lobbyCode = lobbyCreationRequest.body.lobbyCode
})

describe('With an active FPTP election', () => {
    beforeEach(async () => {
        await createElection(exampleFPTPElection)
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

    test('cannot vote without vote content', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode})
        
        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST') 
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
            .then()

        expect(voteCastRequest.status).toBe(200)
    })

    test('can cast an empty vote', async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .set('Authorization', participantID)
            .send({lobbyCode, voteContent: null})

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

describe('With an active ranked election', () => {
    beforeEach(async () => {
        await createElection(exampleRankedElection)
    })

    const castVote = async (voteContent) => {
        return await request(app).post('/participant/castVote')
        .set('Authorization', participantID)
        .send({lobbyCode, voteContent})
    }

    test('Cannot cast a vote for a single candidate', async () => {
        const voteCastRequest = await castVote('Tampere')
        expect(voteCastRequest.statusCode).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST')
    })

    test('Cannot cast votes for an invalid number of candidates', async () => {
        let voteCastRequest = await castVote(['Tampere'])
        expect(voteCastRequest.statusCode).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST')

        voteCastRequest = await castVote(['Tampere', 'Turku', 'Oulu'])
        expect(voteCastRequest.statusCode).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST')
    })

    test('Cannot vote for someone that isn\'t on the ballot', async () => {
        const voteCastRequest = await castVote(['Tampere', 'Rovaniemi'])
        expect(voteCastRequest.statusCode).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST')
    })

    test('Can cast a valid vote', async () => {
        const voteCastRequest = await castVote(['Turku', 'Oulu'])
        expect(voteCastRequest.status).toBe(200)
    })

    test('Can cast an empty vote', async () => {
        const voteCastRequest = await castVote(null)
        expect(voteCastRequest.statusCode).toBe(200)
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

    test('participant socket receives a message when an election is created', (done) => {
        lobbySocket = connectToParticipantSocket()
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'VOTING') {
                done()
            }
            else if (newStatus.status === 'STANDBY') {
                createElection(exampleFPTPElection)
            }
        })
    })

    test('participant socket receives a message when an election is ended', (done) => {
        createElection(exampleFPTPElection)
        lobbySocket =  connectToParticipantSocket()
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            switch (newStatus.status) {
                case 'VOTING':
                    endElection()
                    break
                case 'ELECTION_ENDED':
                    done()
                    break
                default: 
                    true
            }
        })
    })

    test('participant socket receives a message when the host closes the lobby', (done) => {
        lobbySocket = connectToParticipantSocket()
        lobbySocket.on('connect', () => {
            request(app).post('/host/closeLobby')
                .set('Authorization', hostID)
                .send({lobbyCode})
                .then()
        })
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'CLOSING') {
                expect(newStatus.reason === 'HOST_CLOSED').toBeTruthy()
                done()
            }
        })
    })

    test('participant socket receives a message when the lobby is closed due to inactivity', (done) => {
        lobbySocket = connectToParticipantSocket()
        lobbySocket.on('connect', () => {
            dateMock.advanceBy(1000*60*60*3)
            cleanupRoutine()
        })
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'CLOSING') {
                expect(newStatus.reason === 'INACTIVITY').toBeTruthy()
                done()
            }
        })
    })
})