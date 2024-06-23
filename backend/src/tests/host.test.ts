import { Socket } from 'socket.io-client'
import * as lobbyService from '../services/lobbyservice'
import request from 'supertest'
import { app, server } from '../util/server'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import { ElectionInfo, ErrorMessage } from '../types/types'

describe('With a lobby created and one authenticated user in lobby', () => {
    let hostID : string
    let lobbyCode : string
    let lobbySocket : Socket

    beforeEach(async () => {
        lobbyService.resetLobbies()
        const createLobbyResponse = (await request(app).post('/testing/createLobbyWithUser')).body as LobbyWithUserCreationResponse
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
    })

    describe('When ending an election', () => {
        const requestElectionEnd = (lobbyCode? : string, hostID? : string) => (
            request(app).post('/host/endElection')
                .set('Authorization', hostID)
                .send({lobbyCode})
                .then()
        )

        describe('with an active election', () => {
            beforeEach(() => {
                request(app).post('/host/createElection')
                    .set('Authorization', hostID)
                    .send({lobbyCode, electionInfo: {type: 'FPTP', title: 'Test', candidates: ['Candidate 1', 'Candidate 2']} as ElectionInfo})
                    .then()
            })

            test('cannot end an election with invalid or missing info', async () => {
                let endElectionResponse = await requestElectionEnd(lobbyCode === '1234' ? '4321' : '1234', hostID)
                expect(endElectionResponse.status).toBe(404)
                expect((endElectionResponse.body as ErrorMessage).type).toBe('UNAUTHORIZED')

                endElectionResponse = await requestElectionEnd(lobbyCode, '11111111-1111-1111-1111-11111111111')
                expect(endElectionResponse.status).toBe(403)
                expect((endElectionResponse.body as ErrorMessage).type).toBe('UNAUTHORIZED') 
            })

            test('can end an election with valid info', async () => {
                const endElectionResponse = await requestElectionEnd(lobbyCode, hostID)

                expect(endElectionResponse.status).toBe(200)
            })
        })

        test('cannot end an election when there is no election going on', async () => {
            const endElectionResponse = await requestElectionEnd(lobbyCode, hostID)

            expect(endElectionResponse.status).toBe(405)
            expect((endElectionResponse.body as ErrorMessage).type).toBe('NO_ACTIVE_ELECTION')
        })
    })
})