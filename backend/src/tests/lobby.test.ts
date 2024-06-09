import request from 'supertest'
import * as lobbyService from '../services/lobbyservice'
import { app, server } from '../util/server'
import ioc, { SocketOptions, Socket as ClientSocket } from 'socket.io-client'
import { io } from '../util/server'

beforeEach(() => {
    lobbyService.resetLobbies()
})

describe("In a clean state", () => {
    test("can create a new lobby", async () => {
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

    test('can join a lobby queue', async () => {
        expect(lobbyService.getUsersInQueue(lobbyCode).length).toBe(0)
        const userCodeRequest = await request(app).post('/lobby/joinLobby').send({lobbyCode})
        expect(userCodeRequest.statusCode).toBe(200)
        const userCode = userCodeRequest.body.userCode
        expect(lobbyService.isUserInQueue(userCode, lobbyCode)).toBe(true)
    })

    test('error if tries to join a nonexistent lobby', async () => {
        // This is to avoid the 1/10000 chance that the lobby code is the same
        const testLobbyCode = "1234" === lobbyCode ? "1234" : "4321"

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
    let lobbySocket : ClientSocket = null

    beforeAll((done) => {
        server.listen(3000, () => {
            done()
        })
    })

    afterAll(() => {
        io.close()
        lobbySocket.close()
        server.close()
    })

    beforeEach(async () => {
        const lobbyCreationRequest = await request(app).post('/lobby/createLobby')
        lobbyCode = lobbyCreationRequest.body.lobbyCode
        hostID = lobbyCreationRequest.body.hostID
        const userCodeRequest = await request(app).post('/lobby/joinLobby').send({lobbyCode})
        userCode = userCodeRequest.body.userCode
    })
    
    test("host can authenticate a user in queue", async () => {
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)

        const authRequest = await request(app).post('/lobby/authenticateUser')
            .set('Authorization', hostID)
            .send({lobbyCode, userCode})
    })

    test("host cannot authenticate with invalid token", async () => {
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)

        const authRequest = await request(app).post('/lobby/authenticateUser')
            .set('Authorization', '11111111-1111-1111-1111-111111111111')
            .send({lobbyCode, userCode})
        
        expect(authRequest.statusCode).toBe(401)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test("host cannot authenticate other lobbies' users", async () => {
        const lobby2CreationRequest = await request(app).post('/lobby/createLobby')
        const host2ID = lobby2CreationRequest.body.hostID
        
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
        const authRequest = await request(app).post('/lobby/authenticateUser')
            .set('Authorization', host2ID)
            .send({lobbyCode, userCode})
        
        expect(authRequest.statusCode).toBe(401)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test("host cannot authenticate nonexistent user", async () => {
        const invalidUserCode = "1234" === userCode ? "1234" : "4321"

        const authRequest = await request(app).post('/lobby/authenticateUser')
            .set('Authorization', hostID)
            .send({lobbyCode, userCode: invalidUserCode})
        
        expect(authRequest.statusCode).toBe(404)
        expect(lobbyService.getParticipants(lobbyCode).length).toBe(0)
    })

    test("Authenticated user gets a socket message when authenticated", (done) => {
        const socketCallback = jest.fn()
        lobbySocket = ioc('http://localhost:3000/queue', {query: {lobbyCode, userCode}})
        lobbySocket.on('error', (error) => {
            console.error(error)
        })
        lobbySocket.on('authorize', (userID : string) => {
            socketCallback(userID)
            expect(socketCallback.mock.calls).toHaveLength(1)
            expect(socketCallback.mock.lastCall[0].userID).toBeDefined()
            done()
        })
        lobbySocket.on('connect', async () => {
            expect(socketCallback.mock.calls).toHaveLength(0)
            await request(app).post('/lobby/authenticateUser')
                .set('Authorization', hostID)
                .send({lobbyCode, userCode})
        })
    })
})