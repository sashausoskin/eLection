import { server } from '../util/server'
import { Socket, io } from 'socket.io-client'
import * as lobbyService from '../services/lobbyservice'
import { LobbyStatusInfo } from '../types/lobbyTypes'
import { decodeObject, encodeObject } from '../util/encryption'
import { AuthenticationObject } from '../types/communicationTypes'
import * as testUtil from './testUtil'

let lobbyCode : string
let hostToken : string
let hostID : string
let participantToken : string
let lobbySocket : Socket

describe('With a created lobby and user', () => {
    beforeAll((done) => {
        server.listen(3001, () => {
            done()
        })
    })

    beforeEach(async () => {
        lobbyService.resetLobbies()

        const lobbyCreationResponse = await testUtil.createLobbyWithUser()
        lobbyCode = lobbyCreationResponse.lobbyCode
        hostToken = lobbyCreationResponse.hostToken
        hostID = (decodeObject(hostToken) as AuthenticationObject).id
        participantToken = lobbyCreationResponse.participantToken
    })

    afterEach(() => {
        lobbySocket.close()
    })

    afterAll(() => {
        server.close()
    })

    const testSocketConnection = (done?: jest.DoneCallback, hostToken? : string, expectToConnect? : boolean) => {
        lobbySocket = io('http://localhost:3001/viewer', {auth: {token: `Bearer ${hostToken}`}})

        lobbySocket.on('connect', () => {
            if (expectToConnect) done?.()
            else expect(1).toBe(2)
        })
        lobbySocket.on('connect_error', () => {
            if (!expectToConnect) done?.()
            else expect(1).toBe(2)
        })
    }

    test('cannot connect to the socket without authentication info', (done) => {
        testSocketConnection(done)
    })

    test('cannot connect to the socket without a proper authorization token', (done) => {
        testSocketConnection(done, participantToken, false)
    })

    test('cannot connect to the socket with an invalid lobby code', (done) => {
        const fakeAuth = encodeObject({
            id: hostID,
            lobbyCode: lobbyCode === '1234' ? '4321' : '1234'
        } as AuthenticationObject)

        testSocketConnection(done, fakeAuth, false)
    })

    test('can connect to the socket with valid info', (done) => {
        testSocketConnection(done, hostToken, true)
    })

    test('when a new viewer connects, previous gets disconnected', (done) => {
        const lobbySocket2 = io('http://localhost:3001/viewer', {auth: {token: `Bearer ${hostToken}`}})

        lobbySocket2.on('connect', () => {
            lobbySocket = io('http://localhost:3001/viewer', {auth: {token: `Bearer ${hostToken}`}})
            lobbySocket.on('connect', () => {
                expect(lobbySocket2.connected).toBeFalsy()
                done()
            })
            lobbySocket.on('connect_error', () => expect(1).toBe(2))
        })
    })

    test('receives a message when an election is created', (done) => {
        testSocketConnection(undefined, hostToken, true)
        lobbySocket.on('status-change', (lobbyStatus : LobbyStatusInfo) => {
            if (lobbyStatus.status === 'STANDBY') {
                testUtil.createElection(hostToken, {type: 'FPTP', title: 'Is the host a cool guy?', candidates: ['Yeah', 'Hell yeah!']})
            }
            if (lobbyStatus.status === 'VOTING' && lobbyStatus.electionInfo.title === 'Is the host a cool guy?') {
                done()
            }
        })
    })

    test('receives a message when a user joins the lobby', (done) => {
        testSocketConnection(undefined, hostToken, true)

        lobbySocket.on('connect', async () => {
            const joinLobbyResponse = await testUtil.joinLobby(lobbyCode)
            const userCode = joinLobbyResponse.body.userCode

            testUtil.authenticateUser(hostToken, userCode)
            })

        lobbySocket.on('user-joined', (newNumberOfUsers) => {
            if (newNumberOfUsers === 2) done()
        })
    })

    test('receives a message when someone casts a vote', (done) => {
        testUtil.createElection(hostToken, {type: 'FPTP', title: 'Is the host a cool guy?', candidates: ['Yeah', 'Hell yeah!']})
        
        testSocketConnection(undefined, hostToken, true)

        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'VOTING') {
                testUtil.castVote(participantToken, 'Yeah')
            }
        })

        lobbySocket.on('vote-casted', (numberOfVotes) => {
            if (numberOfVotes === 1) done() 
        })
    })

    test('receives a message when the election is ended', (done) => {
        testUtil.createElection(hostToken, {type: 'FPTP', title: 'Is the host a cool guy?', candidates: ['Yeah', 'Hell yeah!']})

        testSocketConnection(undefined, hostToken, true)

        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            switch (newStatus.status) {
                case 'VOTING':
                    testUtil.endElection(hostToken)
                    break
                case 'ELECTION_ENDED':
                    done()
            }
        })
    })

    test('receives a message when the lobby is closed', (done) => {
        testSocketConnection(undefined, hostToken, true)

        lobbySocket.on('connect', () => {
            testUtil.closeLobby(hostToken)
        })
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            if (newStatus.status === 'CLOSING') {
                done()
            }
        })
    })
        
})