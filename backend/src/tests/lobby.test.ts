import * as lobbyService from '../services/lobbyservice'
import { agent as request } from 'supertest'
import { app, server } from '../util/server'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import { io as ioc, Socket as ClientSocket } from 'socket.io-client'
import { ElectionInfo, LobbyStatusInfo } from '../types/types'

describe("With a lobby created and one authenticated user in lobby", () => {
    let participantID : string = null as unknown as string
    let hostID : string = null as unknown as string
    let lobbyCode : string = null as unknown as string 
    let lobbySocket : ClientSocket 

    beforeEach(async () => {
        lobbyService.resetLobbies()
        const createLobbyResponse = (await request(app).post('/testing/createLobbyWithUser')).body as LobbyWithUserCreationResponse
        participantID = createLobbyResponse.participantID
        hostID = createLobbyResponse.hostID
        lobbyCode = createLobbyResponse.lobbyCode
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



    describe("When user is connecting to the lobby socket", () => {
        const testSocketConnection = (lobbyCode : string, participantID : string, done? : jest.DoneCallback, expectToConnect? : boolean) => {
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

        test("Cannot connect without a proper auth token", (done) => {
            testSocketConnection(lobbyCode, "123412421412313", done)
        })

        test("Cannot connect without a proper lobby code", (done) => {
            testSocketConnection(lobbyCode === "1234" ? "4321" : "1234", participantID, done)
        })

        test("Can connect with proper values", (done) => {
            testSocketConnection(lobbyCode, participantID, done, true)
        })

        test("Immediately gets the status-change emit", (done) => {
            lobbySocket = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('connect_error', () => {
                expect(1).toBe(2)
            })
            lobbySocket.on('status-change', () => {
                done()
            })
        })

        test("Cannot have two connections at the same time", (done) => {
            lobbySocket = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('connect_error', (err) => {
                throw new Error(err.message)
            })
            lobbySocket.on('connect', () => {
                const lobbySocket2 = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
                lobbySocket2.on('connect', () => {
                    throw new Error("Second socket connected")
                })
                lobbySocket2.on('connect_error', () => {
                    lobbySocket.disconnect()
                    lobbySocket2.disconnect()
                    done()
                })
            })
        })
    })

    describe("When creating an election", () => {
        const exampleElectionInfo : ElectionInfo = {type: "FPTP", title: "Which language should we use?", candidates: ["Python", "JavaScript"]}

        const requestElectionCreation = (lobbyCode : string, authToken : string, electionInfo) => {
            return request(app).post('/host/createElection')
            .set('Authorization', authToken)
            .send({lobbyCode, electionInfo})
        }

        test("Cannot create an election without a valid lobby code", async () => {
            const createElectionResponse = await requestElectionCreation(lobbyCode === "1234" ? "4321" : "1234", hostID, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(404)
        })

        test("Cannot create an election without a valid token", async () => {
            const createElectionResponse = await requestElectionCreation(lobbyCode, "11111111111", exampleElectionInfo)
            expect(createElectionResponse.status).toBe(403)
        })

        test("Cannot create an election with invalid election info", async () => {
            // No title
            let createElectionResponse = await requestElectionCreation(lobbyCode, hostID, {type: "FPTP", candidates: ["Candidate 1", "Candidate 2"]} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Invalid type
            createElectionResponse = await requestElectionCreation(lobbyCode, hostID, {type: "Authoritarian", title: "Presidential election", candidates: ["Candidate 1", "Candidate 2"]})
            expect(createElectionResponse.status).toBe(400)

            //Only two candidates
            createElectionResponse = await requestElectionCreation(lobbyCode, hostID, {type: "FPTP", title: "Presidential election", candidates: ["Candidate 1"]} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)
        })

        test("Can create an election with valid info", async () => {
            const createElectionResponse = await requestElectionCreation(lobbyCode, hostID, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(200)
        })

        test("Participant sockets receive a message when an election is created", (done) => {
            lobbySocket = ioc('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('status-change', async (newStatus : LobbyStatusInfo) => {
                if (newStatus.status === "STANDBY") {
                    await requestElectionCreation(lobbyCode, hostID, exampleElectionInfo)
                }
                if (newStatus.status === "VOTING") {
                    expect(newStatus.currentVote).toEqual(exampleElectionInfo)
                    done()
                }
            })
        })
    })
})
