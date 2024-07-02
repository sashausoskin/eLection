import request from 'supertest'
import { app, server } from '../util/server'
import { Socket, io } from 'socket.io-client'
import * as lobbyService from '../services/lobbyservice'

let lobbyCode : string
let hostID : string
let participantID : string
let lobbySocket : Socket

describe('With a created lobby and user', () => {
    beforeAll((done) => {
        server.listen(3000, () => {
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
        lobbySocket = io('http://localhost:3000/viewer', {auth: {lobbyCode, hostID}})

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
        const lobbySocket2 = io('http://localhost:3000/viewer', {auth: {lobbyCode, hostID}})

        lobbySocket2.on('connect', () => {
            lobbySocket = io('http://localhost:3000/viewer', {auth: {lobbyCode, hostID}})
            lobbySocket.on('connect', () => {
                expect(lobbySocket2.connected).toBeFalsy()
                done()
            })
            lobbySocket.on('connect_error', () => expect(1).toBe(2))
        })
    })

})