import request from 'supertest'
import * as lobbyService from '../services/lobbyservice'
import { app, server } from '../util/server'
import ioc, { Socket as ClientSocket } from 'socket.io-client'
import { AuthenticationObject } from '../types/communicationTypes'
import { decodeObject, encodeObject } from '../util/encryption'
import { LobbyCreationResponse } from '../types/testTypes'
import * as testUtil from './testUtil'

beforeEach(() => {
    lobbyService.resetLobbies()
})

describe('In a clean state', () => {
    test('can create a new lobby', async () => {
        expect(lobbyService.getNumberOfLobbies()).toBe(0)
        await request(app).post('/lobby/createLobby')
        expect(lobbyService.getNumberOfLobbies()).toBe(1)
    })
})

describe('With one lobby created', () => {
    let lobbyCode = null

    beforeEach(async () => {
        const lobbyCreationResponse = (await testUtil.createLobby()).body as LobbyCreationResponse
        lobbyCode = lobbyCreationResponse.lobbyCode
    })

    test('cannot join a lobby without a lobby code', async () => {
        const userCodeRequest = await testUtil.joinLobby(undefined)
        expect(userCodeRequest.statusCode).toBe(400)
    })

    test('can join a lobby queue', async () => {
        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
        const userCodeRequest = await testUtil.joinLobby(lobbyCode)
        expect(userCodeRequest.statusCode).toBe(200)
        const userCode = userCodeRequest.body.userCode
        expect(lobbyService.isUserInQueue(userCode, lobbyCode)).toBe(true)
    })

    test('error if tries to join a nonexistent lobby', async () => {
        // This is to avoid the 1/10000 chance that the lobby code is the same
        const testLobbyCode = '1234' === lobbyCode ? '1234' : '4321'

        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
        const lobbyRequest = await testUtil.joinLobby(testLobbyCode)
        expect(lobbyRequest.statusCode).toBe(404)
        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
    })
})

describe('With one lobby created and one user in queue', () => {
    let lobbyCode : string
    let hostToken : string
    let hostID : string
    let userCode : string
    let queueSocket : ClientSocket = null

    beforeAll((done) => {
        server.listen(3001, () => {
            done()
        })
    })

    afterAll(() => {
        server.close()
    })

    afterEach(() => {
        if (queueSocket) queueSocket.disconnect()
    })

    beforeEach(async () => {
        const lobbyCreationResponse = (await testUtil.createLobby()).body as LobbyCreationResponse
        lobbyCode = lobbyCreationResponse.lobbyCode
        hostToken = lobbyCreationResponse.token
        hostID = (decodeObject(lobbyCreationResponse.token) as AuthenticationObject).id
        const userCodeRequest = await testUtil.joinLobby(lobbyCode)
        userCode = userCodeRequest.body.userCode
    })
    
    test('host can authenticate a user in queue', async () => {
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)

        await testUtil.authenticateUser(hostToken, userCode)
        
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(1)
    })

    test('host cannot authenticate with missing info', async () => {
        // No auth token
        let authRequest = await testUtil.authenticateUser(undefined, userCode)
        
        expect(authRequest.status).toBe(401)

        // No user code
        authRequest = await testUtil.authenticateUser(hostToken, undefined)
        
        expect(authRequest.status).toBe(400)
    })

    test('host cannot authenticate with invalid token', async () => {
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)

        const fakeAuth = encodeObject({
            id: '11111111-1111-1111-1111-111111111111',
            lobbyCode: lobbyCode
        } as AuthenticationObject)

        const authRequest = await testUtil.authenticateUser(fakeAuth, userCode)
        
        expect(authRequest.statusCode).toBe(403)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test('host cannot authenticate other lobbies\' users', async () => {
        const lobby2CreationResponse = (await request(app).post('/lobby/createLobby')).body as LobbyCreationResponse
        const host2Token = lobby2CreationResponse.token
        
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
        const authRequest = await testUtil.authenticateUser(host2Token, userCode)
        
        expect(authRequest.statusCode).toBe(404)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test('host cannot authenticate nonexistent user', async () => {
        const invalidUserCode = '1234' === userCode ? '1234' : '4321'

        const authRequest = await testUtil.authenticateUser(hostToken, invalidUserCode)
        
        expect(authRequest.statusCode).toBe(404)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test('host validation works', async () => {
        const hostValidationRequest = await testUtil.validateHost(hostToken)

        expect(hostValidationRequest.statusCode).toBe(200)
    })

    test('host validation throws error with invalid info', async () => {
        // Invalid lobby code
        let fakeAuth = encodeObject({
            id: hostID,
            lobbyCode: lobbyCode === '1234' ? '4321' : '1234'
        } as AuthenticationObject)

        let hostValidationRequest = await testUtil.validateHost(fakeAuth)
        expect(hostValidationRequest.statusCode).toBe(404)

        // Invalid ID
        fakeAuth = encodeObject({
            id: '11111111-1111-1111-1111-111111111111',
            lobbyCode
        } as AuthenticationObject)

        hostValidationRequest = await testUtil.validateHost(fakeAuth)
        expect(hostValidationRequest.statusCode).toBe(403)

        // No ID
        fakeAuth = encodeObject({
            id: null,
            lobbyCode
        } as AuthenticationObject)

        hostValidationRequest = await testUtil.validateHost(fakeAuth)
        expect(hostValidationRequest.statusCode).toBe(400)

        // No lobby code
        fakeAuth = encodeObject({
            id: hostID,
            lobbyCode: null
        } as AuthenticationObject)

        hostValidationRequest = await testUtil.validateHost(fakeAuth)
        expect(hostValidationRequest.statusCode).toBe(400)

        // No authentication token
        hostValidationRequest = await testUtil.validateHost(undefined)
        expect(hostValidationRequest.statusCode).toBe(400)

        // Invalid authentication token
        hostValidationRequest = await testUtil.validateHost('11111111-1111-1111-1111-11111111111')
        expect(hostValidationRequest.statusCode).toBe(403)
    })

    test('authenticated user gets a socket message when authenticated', (done) => {
        queueSocket = ioc('http://localhost:3001/queue', {auth: {lobbyCode, userCode}})
        queueSocket.on('connect_error', (error) => {
            console.error(error.message)
        })
        queueSocket.on('authorize', (userToken : string) => {
            expect(userToken).toBeDefined()
            done()
        })
        queueSocket.on('connect', async () => {
            testUtil.authenticateUser(hostToken, userCode)
        })
    })

    test('cannot connect twice to the queue socket', (done) => {
        queueSocket = ioc('http://localhost:3001/queue', {auth: {lobbyCode, userCode}, multiplex: false})
        queueSocket.on('connect', async () => {
            const queueSocket2 = ioc('http://localhost:3001/queue', {auth: {lobbyCode, userCode}, multiplex: false})
            queueSocket2.on('connect_error', () => {
                queueSocket2.disconnect()
                done()
            })
        })
    })
    test('user validation works', async () => {
        const userId = lobbyService.createAuthenticatedUser(lobbyCode)

        const userAuth : AuthenticationObject = {
            lobbyCode,
            id: userId
        }

        const userToken = encodeObject(userAuth)

        const validationRequest = await testUtil.validateUser(userToken)

        expect(validationRequest.statusCode).toBe(200)
    })

    test('user validation returns error with invalid parameters', async () => {
        const userID = lobbyService.createAuthenticatedUser(lobbyCode)

        //Made-up token
        let validationRequest = await testUtil.validateUser('11111111-1111-1111-1111-111111111111')
        expect(validationRequest.statusCode).toBe(403)

        //Incorrect lobby code
        let fakeAuth = encodeObject({
            id: userID,
            lobbyCode: lobbyCode === '1234' ? '4321' : '1234'
        } as AuthenticationObject)

        validationRequest = await testUtil.validateUser(fakeAuth)
        expect(validationRequest.statusCode).toBe(401)

        //Incorrect user ID
        fakeAuth = encodeObject({
            id: '11111111-1111-1111-1111-111111111111',
            lobbyCode
        } as AuthenticationObject)

        validationRequest = await testUtil.validateUser(fakeAuth)
        expect(validationRequest.statusCode).toBe(401)

        //Missing ID
        fakeAuth = encodeObject({
            lobbyCode
        })

        validationRequest = await testUtil.validateUser(fakeAuth)
        expect(validationRequest.statusCode).toBe(401)

        //Missing lobby code
        fakeAuth = encodeObject({
            id: userID
        })

        validationRequest = await testUtil.validateUser(fakeAuth)
        expect(validationRequest.statusCode).toBe(401)

        //No authentication token
        validationRequest = await testUtil.validateUser(undefined)
        expect(validationRequest.statusCode).toBe(400)
    })

    describe('when connecting to the queue socket', () => {

        const testSocketConnection = (done: jest.DoneCallback, lobbyCode?: string, userCode?: string, expectToConnect?: boolean) => {
            queueSocket = ioc('http://localhost:3001/queue', {auth: {lobbyCode, userCode}, multiplex: false})
            queueSocket.on('connect', () => {
                if (expectToConnect) done()
                else expect(1).toBe(2)
            })
            queueSocket.on('connect_error', () => {
                if (!expectToConnect) done()
                else expect(1).toBe(2)
            })
        }

        test('cannot connect without lobby and user info', (done) => {
            testSocketConnection(done)
        })

        test('cannot connect with invalid user code', (done) => {
            testSocketConnection(done, lobbyCode, userCode === '1234' ? '4321' : '1234', false)
        })

        test('cannot connect with invalid lobby code', (done) => {
            testSocketConnection(done, lobbyCode === '1234' ? '4321' : '1234', userCode, false)
        })

        test('can connect with valid info', (done) => {
            testSocketConnection(done, lobbyCode, userCode, true)
        })

        test('cannot connect twice', (done) => {
            const queuedSocket2 = ioc('http://localhost:3001/queue', {auth: {lobbyCode, userCode}, multiplex: false})
            queuedSocket2.on('connect', () => {
                testSocketConnection(done, lobbyCode, userCode, false)
                queuedSocket2.disconnect()
            })
        })
    })
})