import request from 'supertest'
import { app, server } from '../util/server'
import { ElectionInfo } from '../types/lobbyTypes'
import { LobbyStatusInfo } from '../types/lobbyTypes'
import * as lobbyService from '../services/lobbyservice'
import { Socket, io as ioc } from 'socket.io-client'
import * as dateMock from 'jest-date-mock'
import { cleanupRoutine } from '../services/cleanupservice'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import * as testUtil from './testUtil'
import { encodeObject } from '../util/encryption'
import { AuthenticationObject } from '../types/communicationTypes'

let hostToken : string
let participantToken : string
let participantID : string
let lobbyCode : string
let lobbySocket : Socket

const exampleFPTPElection : ElectionInfo = {type: 'FPTP', title: 'Presidential election 2024', candidates: ['Donald Trump', 'Joe Biden']}
const exampleRankedElection : ElectionInfo = {type: 'ranked', title: 'Where should the Finnish capital be moved?', candidates: ['Tampere', 'Turku', 'Oulu'], candidatesToRank: 2}

beforeEach(() => {
    dateMock.clear()
})

beforeAll((done) => {
    server.listen(3001, () => {
        done()
    })
})

afterEach(() => {
    if (lobbySocket) lobbySocket.disconnect()
})

afterAll((done) => {
    server.close(done)
})

const createElection = async (electionInfo : ElectionInfo) => {
    return await request(app).post('/host/createElection')
                .set('Authorization', `Bearer ${hostToken}`)
                .send({electionInfo})
                // I don't know why, but removing then() breaks this test. I am incredibly confused...
                .then()
}

const endElection = async () => {
    return await request(app).post('/host/endElection')
                .set('Authorization', `Bearer ${hostToken}`)
                .then()
}

const connectToParticipantSocket = () : Socket => {
    return ioc('http://localhost:3001/lobby', {auth: {token: `Bearer ${participantToken}`}})
}

beforeEach(async () => {
    lobbyService.resetLobbies()

    const lobbyCreationResponse : LobbyWithUserCreationResponse = await testUtil.createLobbyWithUser()
    hostToken = lobbyCreationResponse.hostToken
    participantToken = lobbyCreationResponse.participantToken
    lobbyCode = lobbyCreationResponse.lobbyCode
    participantID = lobbyCreationResponse.participantID
})

describe('With an active FPTP election', () => {
    beforeEach(async () => {
        await testUtil.createElection(hostToken, exampleFPTPElection)
    })

    test('cannot vote without an authorization token', async () => {
        const voteCastRequest = await testUtil.castVote(undefined, 'Joe Biden')
        
        expect(voteCastRequest.status).toBe(401)
        expect(voteCastRequest.body.type).toBe('MISSING_AUTH_TOKEN')
    })

    test('cannot vote with an invalid authorization token', async () => {
        const voteCastRequest = await testUtil.castVote('1111111111-111111', 'Joe Biden')
        
        expect(voteCastRequest.status).toBe(403)
        expect(voteCastRequest.body.type).toBe('UNAUTHORIZED') 
    })

    test('cannot vote without a lobby code', async () => {
        const fakeAuth = encodeObject({lobbyCode: null, id: participantID} as AuthenticationObject)

        const voteCastRequest = await testUtil.castVote(fakeAuth, 'Joe Biden')
        
        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MISSING_LOBBY_CODE') 
    })

    test('cannot vote without a valid lobby code', async () => {
        const fakeAuth = encodeObject({lobbyCode: lobbyCode === '1234' ? '4321' : '1234', id: participantID} as AuthenticationObject)

        const voteCastRequest = await testUtil.castVote(fakeAuth, 'Joe Biden')
        
        expect(voteCastRequest.status).toBe(404)
        expect(voteCastRequest.body.type).toBe('UNAUTHORIZED') 
    })

    test('cannot vote with an invalid ID', async () => {
        const fakeAuth = encodeObject({lobbyCode, id: '11111111-1111-1111-1111-111111111111'} as AuthenticationObject)

        const voteCastRequest = await testUtil.castVote(fakeAuth, 'Joe Biden')
        
        expect(voteCastRequest.status).toBe(403)
        expect(voteCastRequest.body.type).toBe('UNAUTHORIZED') 
    })

    test('cannot vote without vote content', async () => {
        const voteCastRequest = await testUtil.castVote(participantToken, undefined)

        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST') 
    })

    test('cannot vote for a person that isn\'t a candidate', async () => {
        const voteCastRequest = await testUtil.castVote(participantToken, 'Barack Obama')

        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST') 
    })

    test('can vote with valid info', async () => {
        const voteCastRequest = await testUtil.castVote(participantToken, 'Joe Biden')

        expect(voteCastRequest.status).toBe(200)
    })

    test('can cast an empty vote', async () => {
        const voteCastRequest = await testUtil.castVote(participantToken, null)

        expect(voteCastRequest.status).toBe(200)
    })

    test('cannot vote twice', async () => {
        let voteCastRequest = await testUtil.castVote(participantToken, 'Joe Biden')

        expect(voteCastRequest.status).toBe(200)

        voteCastRequest = await testUtil.castVote(participantToken, 'Joe Biden')

        expect(voteCastRequest.status).toBe(403)
        expect(voteCastRequest.body.type).toBe('ALREADY_VOTED')
    })

    test('cannot vote for an array of candidates', async () => {
        const voteCastRequest = await testUtil.castVote(participantToken, ['Joe Biden', 'Donald Trump'])

        expect(voteCastRequest.status).toBe(400)
        expect(voteCastRequest.body.type).toBe('MALFORMATTED_REQUEST')
    })
})

describe('With an active ranked election', () => {
    beforeEach(async () => {
        await createElection(exampleRankedElection)
    })

    const castVote = async (voteContent) => {
        return await testUtil.castVote(participantToken, voteContent)
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

    test('Cannot have a candidate ranked two times', async () => {
        const voteCastRequest = await castVote(['Oulu', 'Oulu'])
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

        const lobbyCreationRequest = await testUtil.createLobbyWithUser()
        hostToken = lobbyCreationRequest.hostToken
        participantToken = lobbyCreationRequest.participantToken
        lobbyCode = lobbyCreationRequest.lobbyCode
    })

    test('cannot vote',  async () => {
        const voteCastRequest = await testUtil.castVote(participantToken, 'Joe Biden')

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
            }
        })
    })

    test('participant socket receives a message when the host closes the lobby', (done) => {
        lobbySocket = connectToParticipantSocket()
        lobbySocket.on('connect', () => {
            request(app).post('/host/closeLobby')
                .set('Authorization', `Bearer ${hostToken}`)
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