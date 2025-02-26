import * as lobbyService from '../services/lobbyservice'
import request from 'supertest'
import * as dateMock from 'jest-date-mock'
import { app, server } from '../util/server'
import { io as ioc, Socket as ClientSocket } from 'socket.io-client'
import { LobbyStatusInfo } from '../types/lobbyTypes'
import { cleanupRoutine } from '../services/cleanupservice'
import * as testUtil from './testUtil'
import { encodeObject } from '../util/encryption'
import { AuthenticationObject } from '../types/communicationTypes'

describe('With a lobby created and one authenticated user in lobby', () => {
    let participantToken : string
    let participantID : string
    let hostToken : string
    let lobbySocket : ClientSocket 
    let lobbyCode : string

    beforeEach(async () => {
        lobbyService.resetLobbies()
        dateMock.advanceTo(new Date(0, 0, 0, 0, 0, 0, 0))
        const createLobbyResponse = await testUtil.createLobbyWithUser()
        participantToken = createLobbyResponse.participantToken
        participantID = createLobbyResponse.participantID
        hostToken = createLobbyResponse.hostToken
        lobbyCode = createLobbyResponse.lobbyCode
    })

    beforeAll((done) => {
        server.listen(3001, () => {
            done()
        })
    })

    afterEach(() => {
        if (lobbySocket) lobbySocket.disconnect()
            
    })

    afterAll(() => {
        server.close()
    })

    test('Ping ponging works', async () => {
        const pingRequest = await request(app).get('/ping')
        expect(pingRequest.text).toBe('pong')
    })

    describe('When user is connecting to the lobby socket', () => {
        const testSocketConnection = (participantToken? : string, done? : jest.DoneCallback, expectToConnect? : boolean) => {
            lobbySocket = ioc('http://localhost:3001/lobby', {auth: {token: participantToken ? `Bearer ${participantToken}` : null}})
            lobbySocket.on('connect_error', () => {
                if (expectToConnect) expect(1).toBe(2)
                else done?.()
            })
            lobbySocket.on('connect', () => {
                if (expectToConnect) done?.()
                else expect(1).toBe(2)
            })
        }

        test('Cannot connect without entering an auth token', (done) => {
            testSocketConnection(null, done)
        })

        test('Cannot connect without a proper auth token', (done) => {
            testSocketConnection('123412421412313', done)
        })

        test('Cannot connect with an invalid lobby code', (done) => {
            const testToken = encodeObject({
                lobbyCode: lobbyCode === '1234' ? '4321' : '1234',
                id: participantID
            } as AuthenticationObject)

            testSocketConnection(testToken, done, false)
        })

        test('Cannot connect with an invalid ID', (done) => {
            const testToken = encodeObject({
                lobbyCode,
                id: '11111111-1111-1111-1111-111111111111'
            } as AuthenticationObject)

            testSocketConnection(testToken, done, false)
        })

        test('Cannot connect without a lobby code', (done) => {
            const testToken = encodeObject({
                lobbyCode: null,
                id: participantID
            } as AuthenticationObject)

            testSocketConnection(testToken, done, false)
        })

        test('Cannot connect without an ID', (done) => {
            const testToken = encodeObject({
                lobbyCode,
                id: null
            } as AuthenticationObject)

            testSocketConnection(testToken, done, false)
        })

        test('Can connect with proper values', (done) => {
            testSocketConnection(participantToken, done, true)
        })

        test('Immediately gets the status-change emit', (done) => {
            lobbySocket = ioc('http://localhost:3001/lobby', {auth: {token: `Bearer ${participantToken}`}})
            lobbySocket.on('connect_error', () => {
                expect(1).toBe(2)
            })
            lobbySocket.on('status-change', () => {
                done()
            })
        })

        test('Cannot have two connections at the same time', (done) => {
            lobbySocket = ioc('http://localhost:3001/lobby', {auth: {token: `Bearer ${participantToken}`}})
            lobbySocket.on('connect_error', (err) => {
                throw new Error(err.message)
            })
            lobbySocket.on('connect', () => {
                const lobbySocket2 = ioc('http://localhost:3001/lobby', {auth: {token: `Bearer ${participantToken}`}})
                lobbySocket2.on('connect', () => {
                    expect(lobbySocket.connected).toBe(false)
                    expect(lobbySocket2.connected).toBe(true)
                    done()
                })
            })
        })

        test('can reconnect after disconnection', (done) => {
            testSocketConnection(participantToken, null, true)
            lobbySocket.disconnect()
            testSocketConnection(participantToken, done, true)
        })

        test('will receive the STANDBY status if has casted a vote', (done) => {
            testUtil.createElection(hostToken, {type: 'FPTP', title: 'Test', candidates: ['Candidate 1', 'Candidate 2']})
            testUtil.castVote(participantToken, 'Candidate 1')
            
            testSocketConnection(participantToken, null, true)
            lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
                if (newStatus.status === 'STANDBY') done()
            })
        })
    })

    describe('when performing server cleanup', () => {
        test('doesn\'t delete a lobby that has been an active', () => {
            expect(lobbyService.getNumberOfLobbies()).toBe(1)
            dateMock.advanceBy(1000*60*30)
            cleanupRoutine()
            expect(lobbyService.getNumberOfLobbies()).toBe(1)
        })

        test('deletes a lobby that has been inactive', () => {
            expect(lobbyService.getNumberOfLobbies()).toBe(1)
            dateMock.advanceBy(1000*60*60*3)
            cleanupRoutine()
            expect(lobbyService.getNumberOfLobbies()).toBe(0)
        })
    })
})
