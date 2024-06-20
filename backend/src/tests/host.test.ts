import { Socket, io } from 'socket.io-client'
import * as lobbyService from '../services/lobbyservice'
import request from 'supertest'
import { app, server } from '../util/server'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import { ElectionInfo, LobbyStatusInfo } from '../types/types'

describe('With a lobby created and one authenticated user in lobby', () => {
    let participantID : string
    let hostID : string
    let lobbyCode : string
    let lobbySocket : Socket

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

    describe('When creating an election', () => {
        const exampleElectionInfo : ElectionInfo = {type: 'FPTP', title: 'Which language should we use?', candidates: ['Python', 'JavaScript']}

        const requestElectionCreation = (lobbyCode : string, authToken : string, electionInfo) => {
            return request(app).post('/host/createElection')
            .set('Authorization', authToken)
            .send({lobbyCode, electionInfo})
        }

        test('Cannot create an election without a valid lobby code', async () => {
            const createElectionResponse = await requestElectionCreation(lobbyCode === '1234' ? '4321' : '1234', hostID, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(404)
        })

        test('Cannot create an election without a valid token', async () => {
            const createElectionResponse = await requestElectionCreation(lobbyCode, '11111111111', exampleElectionInfo)
            expect(createElectionResponse.status).toBe(403)
        })

        test('Cannot create an election with missing auth information', async () => {
            // No lobby code
            let createElectionResponse = await requestElectionCreation(null, hostID, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(400)
            expect(createElectionResponse.body.type).toBe('MISSING_LOBBY_CODE')
            
            // No authorization header
            createElectionResponse = await request(app).post('/host/createElection')
                .send({lobbyCode, electionInfo: exampleElectionInfo})
            expect(createElectionResponse.status).toBe(401)
            expect(createElectionResponse.body.type).toBe('MISSING_AUTH_TOKEN')
        })

        test('Cannot create an election with invalid election info', async () => {
            // No title
            let createElectionResponse = await requestElectionCreation(lobbyCode, hostID, {type: 'FPTP', candidates: ['Candidate 1', 'Candidate 2']} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Invalid type
            createElectionResponse = await requestElectionCreation(lobbyCode, hostID, {type: 'Authoritarian', title: 'Presidential election', candidates: ['Candidate 1', 'Candidate 2']})
            expect(createElectionResponse.status).toBe(400)

            //Only two candidates
            createElectionResponse = await requestElectionCreation(lobbyCode, hostID, {type: 'FPTP', title: 'Presidential election', candidates: ['Candidate 1']} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)
        })

        test('Can create an election with valid info', async () => {
            const createElectionResponse = await requestElectionCreation(lobbyCode, hostID, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(200)
        })

        test('Participant sockets receive a message when an election is created', (done) => {
            lobbySocket = io('http://localhost:3000/lobby', {auth: {lobbyCode, participantID}})
            lobbySocket.on('status-change', async (newStatus : LobbyStatusInfo) => {
                if (newStatus.status === 'STANDBY') {
                    await requestElectionCreation(lobbyCode, hostID, exampleElectionInfo)
                }
                if (newStatus.status === 'VOTING') {
                    expect(newStatus.currentVote).toEqual(exampleElectionInfo)
                    done()
                }
            })
        })
    })
})