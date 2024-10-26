import request from 'supertest'
import * as lobbyService from '../services/lobbyservice'
import { app, server } from '../util/server'
import ioc, { Socket as ClientSocket } from 'socket.io-client'
import { AuthenticationObject } from '../types/communicationTypes'
import { encodeObject } from '../util/encryption'

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
        const lobbyCreationRequest = await request(app).post('/lobby/createLobby')
        lobbyCode = lobbyCreationRequest.body.lobbyCode
    })

    test('cannot join a lobby without a lobby code', async () => {
        const userCodeRequest = await request(app).post('/lobby/joinLobby').send()
        expect(userCodeRequest.statusCode).toBe(400)
    })

    test('can join a lobby queue', async () => {
        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
        const userCodeRequest = await request(app).post('/lobby/joinLobby').send({lobbyCode})
        expect(userCodeRequest.statusCode).toBe(200)
        const userCode = userCodeRequest.body.userCode
        expect(lobbyService.isUserInQueue(userCode, lobbyCode)).toBe(true)
    })

    test('error if tries to join a nonexistent lobby', async () => {
        // This is to avoid the 1/10000 chance that the lobby code is the same
        const testLobbyCode = '1234' === lobbyCode ? '1234' : '4321'

        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
        const lobbyRequest = await request(app).post('/lobby/joinLobby').send({lobbyCode: testLobbyCode})
        expect(lobbyRequest.statusCode).toBe(404)
        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
    })
})

describe('With one lobby created and one user in queue', () => {
    let lobbyCode : string | null = null
    let hostID : string | null = null
    let userCode : string | null = null
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
        const lobbyCreationRequest = await request(app).post('/lobby/createLobby')
        lobbyCode = lobbyCreationRequest.body.lobbyCode
        hostID = lobbyCreationRequest.body.hostID
        const userCodeRequest = await request(app).post('/lobby/joinLobby').send({lobbyCode})
        userCode = userCodeRequest.body.userCode
    })

    const validateUser = async (userToken? : string) => {
        return await request(app).post('/lobby/validateUserInfo')
        .set('Authorization', userToken)
        .send()
    }

    const validateHost = async (lobbyCode? : string, hostID? : string) => {
        return await request(app).post('/lobby/validateHostInfo').send({lobbyCode, hostID})
    }
    
    test('host can authenticate a user in queue', async () => {
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)

        await request(app).post('/host/authenticateUser')
            .set('Authorization', hostID)
            .send({lobbyCode, userCode})
    })

    test('host cannot authenticate with missing info', async () => {
        // No auth token
        const authRequest = await request(app).post('/host/authenticateUser')
            .send({lobbyCode, userCode})
        
        expect(authRequest.status).toBe(401)

        // No lobby code
        await request(app).post('/host/authenticateUser')
            .set('Authorization', hostID)
            .send({ userCode})
        
        expect(authRequest.status).toBe(401)

        // No user code
        await request(app).post('/host/authenticateUser')
            .set('Authorization', hostID)
            .send({ lobbyCode })
        
        expect(authRequest.status).toBe(401)
    })

    test('host cannot authenticate with invalid token', async () => {
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)

        const authRequest = await request(app).post('/host/authenticateUser')
            .set('Authorization', '11111111-1111-1111-1111-111111111111')
            .send({lobbyCode, userCode})
        
        expect(authRequest.statusCode).toBe(403)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test('host cannot authenticate other lobbies\' users', async () => {
        const lobby2CreationRequest = await request(app).post('/lobby/createLobby')
        const host2ID = lobby2CreationRequest.body.hostID
        
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
        const authRequest = await request(app).post('/host/authenticateUser')
            .set('Authorization', host2ID)
            .send({lobbyCode, userCode})
        
        expect(authRequest.statusCode).toBe(403)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test('host cannot authenticate nonexistent user', async () => {
        const invalidUserCode = '1234' === userCode ? '1234' : '4321'

        const authRequest = await request(app).post('/host/authenticateUser')
            .set('Authorization', hostID)
            .send({lobbyCode, userCode: invalidUserCode})
        
        expect(authRequest.statusCode).toBe(404)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test('host validation works', async () => {
        const hostValidationRequest = await validateHost(lobbyCode, hostID)

        expect(hostValidationRequest.statusCode).toBe(200)
    })

    test('host validation throws error with invalid info', async () => {
        let hostValidationRequest = await validateHost(lobbyCode === '1234' ? '4321' : '1234', hostID)
        expect(hostValidationRequest.statusCode).toBe(404)

        hostValidationRequest = await validateHost(lobbyCode, '11111111-1111-1111-1111-111111111111')
        expect(hostValidationRequest.statusCode).toBe(403)

        hostValidationRequest = await validateHost(lobbyCode)
        expect(hostValidationRequest.statusCode).toBe(400)

        hostValidationRequest = await validateHost(undefined, hostID)
        expect(hostValidationRequest.statusCode).toBe(400)
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
            await request(app).post('/host/authenticateUser')
                .set('Authorization', hostID)
                .send({lobbyCode, userCode})
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

        const userToken = `Bearer ${encodeObject(userAuth)}`

        const validationRequest = await validateUser(userToken)

        expect(validationRequest.statusCode).toBe(200)
    })

    test('user validation returns error with invalid parameters', async () => {
        lobbyService.createAuthenticatedUser(lobbyCode)

        const validationRequest = await validateUser('11111111-1111-1111-1111-111111111111')
        expect(validationRequest.statusCode).toBe(403)
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