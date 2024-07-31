import request from 'supertest'
import { app, server } from '../util/server'
import { Socket, io } from 'socket.io-client'
import * as lobbyService from '../services/lobbyservice'
import { ElectionInfo, LobbyStatusInfo } from '../types/lobbyTypes'

let lobbyCode : string
let hostID : string
let participantID : string
let lobbySocket : Socket

describe('With a created lobby and user', () => {
    beforeAll((done) => {
        server.listen(3001, () => {
            done()
        })
    })

    beforeEach(async () => {
        lobbyService.resetLobbies()

        const lobbyCreationResponse = await request(app).post('/testing/createLobbyWithUser')
        lobbyCode = lobbyCreationResponse.body.lobbyCode
        hostID = lobbyCreationResponse.body.hostID
        participantID = lobbyCreationResponse.body.participantID
    })

    afterEach(() => {
        lobbySocket.close()
    })

    afterAll(() => {
        server.close()
    })

    const testSocketConnection = (done?: jest.DoneCallback, lobbyCode? : string, hostID? : string, expectToConnect? : boolean) => {
        lobbySocket = io('http://localhost:3001/viewer', {auth: {lobbyCode, hostID}})

        lobbySocket.on('connect', () => {
            if (expectToConnect) done &&done()
            else expect(1).toBe(2)
        })
        lobbySocket.on('connect_error', () => {
            if (!expectToConnect) done && done()
            else expect(1).toBe(2)
        })
    }

    test('cannot connect to the socket without authentication info', (done) => {
        testSocketConnection(done)
    })

    test('cannot connect to the socket without a proper authorization token', (done) => {
        testSocketConnection(done, lobbyCode, participantID, false)
    })

    test('cannot connect to the socket with an invalid lobby code', (done) => {
        testSocketConnection(done, lobbyCode === '1234' ? '4321' : '1234', hostID, false)
    })

    test('can connect to the socket with valid info', (done) => {
        testSocketConnection(done, lobbyCode, hostID, true)
    })

    test('when a new viewer connects, previous gets disconnected', (done) => {
        const lobbySocket2 = io('http://localhost:3001/viewer', {auth: {lobbyCode, hostID}})

        lobbySocket2.on('connect', () => {
            lobbySocket = io('http://localhost:3001/viewer', {auth: {lobbyCode, hostID}})
            lobbySocket.on('connect', () => {
                expect(lobbySocket2.connected).toBeFalsy()
                done()
            })
            lobbySocket.on('connect_error', () => expect(1).toBe(2))
        })
    })

    test('receives a message when an election is created', (done) => {
        testSocketConnection(undefined, lobbyCode, hostID, true)
        lobbySocket.on('status-change', (lobbyStatus : LobbyStatusInfo) => {
            if (lobbyStatus.status === 'STANDBY') {
                request(app).post('/host/createElection')
                    .set('Authorization', hostID)
                    .send({lobbyCode, electionInfo: {type: 'FPTP', title: 'Is the host a cool guy?', candidates: ['Yeah', 'Hell yeah!']} as ElectionInfo})
                    .then()
            }
            if (lobbyStatus.status === 'VOTING' && lobbyStatus.electionInfo.title === 'Is the host a cool guy?') {
                done()
            }
        })
    })

    test('receives a message when a user joins the lobby', (done) => {
        testSocketConnection(undefined, lobbyCode, hostID, true)

        lobbySocket.on('connect', () => {
            request(app).post('/lobby/joinLobby')
            .send({lobbyCode})
            .then((res) => {
                const userCode = res.body.userCode

                request(app).post('/host/authenticateUser')
                    .set('Authorization', hostID)
                    .send({lobbyCode, userCode})
                    .then()
            })
        })

        lobbySocket.on('user-joined', (newNumberOfUsers) => {
            if (newNumberOfUsers === 2) done()
        })
    })

    test('receives a message when someone casts a vote', (done) => {
        request(app).post('/host/createElection')
                    .set('Authorization', hostID)
                    .send({lobbyCode, electionInfo: {type: 'FPTP', title: 'Is the host a cool guy?', candidates: ['Yeah', 'Hell yeah!']} as ElectionInfo})
                    .then()
        
        testSocketConnection(undefined, lobbyCode, hostID, true)

        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'VOTING') {
                request(app).post('/participant/castVote')
                    .set('Authorization', participantID)
                    .send({lobbyCode, voteContent: 'Yeah'})
                    .then()
            }
        })

        lobbySocket.on('vote-casted', (numberOfVotes) => {
            if (numberOfVotes === 1) done() 
        })
    })

    test('receives a message when the election is ended', (done) => {
        request(app).post('/host/createElection')
            .set('Authorization', hostID)
            .send({lobbyCode, electionInfo: {type: 'FPTP', title: 'Is the host a cool guy?', candidates: ['Yeah', 'Hell yeah!']} as ElectionInfo})
            .then()

        testSocketConnection(undefined, lobbyCode, hostID, true)

        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            switch (newStatus.status) {
                case 'VOTING':
                    request(app).post('/host/endElection')
                    .set('Authorization', hostID)
                    .send({lobbyCode})
                    .then()
                    break
                case 'ELECTION_ENDED':
                    done()
            }
        })
    })

    test('receives a message when the lobby is closed', (done) => {
        testSocketConnection(undefined, lobbyCode, hostID, true)

        lobbySocket.on('connect', () => {
            request(app).post('/host/closeLobby')
                .set('Authorization', hostID)
                .send({lobbyCode})
                .then()
        })
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'CLOSING') {
                done()
            }
        })
    })
        
})