import * as lobbyService from '../services/lobbyservice'
import request from 'supertest'
import * as dateMock from 'jest-date-mock'
import { app, server } from '../util/server'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import { io as ioc, Socket as ClientSocket } from 'socket.io-client'
import { ElectionInfo, LobbyStatusInfo } from '../types/types'
import { cleanupRoutine } from '../services/cleanupservice'

describe('With a lobby created and one authenticated user in lobby', () => {
    let participantID : string
    let hostID : string
    let lobbyCode : string
    let lobbySocket : ClientSocket 

    beforeEach(async () => {
        lobbyService.resetLobbies()
        dateMock.advanceTo(new Date(0, 0, 0, 0, 0, 0, 0))
        const createLobbyResponse = (await request(app).post('/testing/createLobbyWithUser')).body as LobbyWithUserCreationResponse
        participantID = createLobbyResponse.participantID
        lobbyCode = createLobbyResponse.lobbyCode
        hostID = createLobbyResponse.hostID
    })

    beforeAll((done) => {
        server.listen(3000, () => {
            done()
        })
    })

    afterEach(() => {
        if (lobbySocket) lobbySocket.disconnect()
            
    })

    afterAll(() => {
        server.close()
    })



    describe('When user is connecting to the lobby socket', () => {
        const testSocketConnection = (lobbyCode? : string, participantID? : string, done? : jest.DoneCallback, expectToConnect? : boolean) => {
            lobbySocket = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('connect_error', () => {
                if (expectToConnect) expect(1).toBe(2)
                else done && done()
            })
            lobbySocket.on('connect', () => {
                if (expectToConnect) done && done()
                else expect(1).toBe(2)
            })
        }

        test('Cannot connect without entering lobby code', (done) => {
            testSocketConnection(null, participantID, done)
        })

        test('Cannot connect without entering an auth token', (done) => {
            testSocketConnection(lobbyCode, null, done)
        })

        test('Cannot connect without a proper auth token', (done) => {
            testSocketConnection(lobbyCode, '123412421412313', done)
        })

        test('Cannot connect without a proper lobby code', (done) => {
            testSocketConnection(lobbyCode === '1234' ? '4321' : '1234', participantID, done)
        })

        test('Can connect with proper values', (done) => {
            testSocketConnection(lobbyCode, participantID, done, true)
        })

        test('Immediately gets the status-change emit', (done) => {
            lobbySocket = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('connect_error', () => {
                expect(1).toBe(2)
            })
            lobbySocket.on('status-change', () => {
                done()
            })
        })

        test('Cannot have two connections at the same time', (done) => {
            lobbySocket = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('connect_error', (err) => {
                throw new Error(err.message)
            })
            lobbySocket.on('connect', () => {
                const lobbySocket2 = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
                lobbySocket2.on('connect', () => {
                    throw new Error('Second socket connected')
                })
                lobbySocket2.on('connect_error', () => {
                    lobbySocket.disconnect()
                    lobbySocket2.disconnect()
                    done()
                })
            })
        })

        test('can reconnect after disconnection', (done) => {
            testSocketConnection(lobbyCode, participantID, null, true)
            lobbySocket.disconnect()
            testSocketConnection(lobbyCode, participantID, done, true)
        })

        test('will receive the STANDBY status if has casted a vote', (done) => {
            request(app).post('/host/createElection')
                .set('Authorization', hostID)
                .send({lobbyCode, electionInfo: {type: 'FPTP', title: 'Test', candidates: ['Candidate 1', 'Candidate 2']} as ElectionInfo})
                //Without then() Jest gets stuck.
                .then()
            
            request(app).post('/participant/castVote')
                .set('Authorization', participantID)
                .send({lobbyCode, voteContent: 'Candidate 1'})
                .then()
            
            testSocketConnection(lobbyCode, participantID, null, true)
            lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
                expect(newStatus.status).toBe('STANDBY')
                done()
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
