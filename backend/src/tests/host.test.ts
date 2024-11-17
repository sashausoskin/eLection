import { Socket } from 'socket.io-client'
import * as lobbyService from '../services/lobbyservice'
import request from 'supertest'
import { app, server } from '../util/server'
import { LobbyWithUserCreationResponse } from '../types/testTypes'
import { AuthenticationObject, ErrorMessage } from '../types/communicationTypes'
import { ElectionInfo } from '../types/lobbyTypes'
import { decodeObject, encodeObject } from '../util/encryption'
import * as testUtil from './testUtil'

describe('With a lobby created and one authenticated user in lobby', () => {
    let hostToken : string
    let hostID : string
    let lobbyCode : string
    let lobbySocket : Socket
    let participantToken : string

    const exampleElectionInfo : ElectionInfo = {type: 'FPTP', title: 'Which language should we use?', candidates: ['Python', 'JavaScript']}

    beforeEach(async () => {
        lobbyService.resetLobbies()
        const createLobbyResponse = (await request(app).post('/testing/createLobbyWithUser')).body as LobbyWithUserCreationResponse
        hostToken = createLobbyResponse.hostToken
        lobbyCode = createLobbyResponse.lobbyCode
        participantToken = createLobbyResponse.participantToken
        hostID = (decodeObject(hostToken) as AuthenticationObject).id
    })

    afterEach(() => {
        server.close()
        if (lobbySocket) lobbySocket.disconnect()
    })

    const requestElectionStatus = async () => {
        return await request(app).get('/host/getElectionStatus')
        .set('Authorization', `Bearer ${hostToken}`)
        .then()
    }

    describe('When creating an election', () => {
        test('Cannot create an election without a valid lobby code', async () => {
            const fakeAuth = encodeObject({
                lobbyCode: lobbyCode === '1234' ? '4321' : '1234',
                id: hostID
            } as AuthenticationObject)

            const createElectionResponse = await testUtil.createElection(fakeAuth, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(404)
        })

        test('Cannot create an election without a valid ID', async () => {
            const fakeAuth = encodeObject({
                lobbyCode,
                id: '11111111111'
            } as AuthenticationObject)

            const createElectionResponse = await testUtil.createElection(fakeAuth, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(403)
        })

        test('Cannot create an election with missing auth information', async () => {
            // No lobby code
            const fakeAuth = encodeObject({
                lobbyCode: null,
                hostToken
            })

            let createElectionResponse = await testUtil.createElection(fakeAuth, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(400)
            expect(createElectionResponse.body.type).toBe('MISSING_LOBBY_CODE')
            
            // No authorization header
            createElectionResponse = await request(app).post('/host/createElection')
                .send({electionInfo: exampleElectionInfo})
            expect(createElectionResponse.status).toBe(401)
            expect(createElectionResponse.body.type).toBe('MISSING_AUTH_TOKEN')
        })

        test('Cannot create an election with invalid election info', async () => {
            // No title
            let createElectionResponse = await testUtil.createElection(hostToken, {type: 'FPTP', candidates: ['Candidate 1', 'Candidate 2']} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Invalid type
            createElectionResponse = await testUtil.createElection(hostToken, {type: 'Authoritarian', title: 'Presidential election', candidates: ['Candidate 1', 'Candidate 2']} as unknown as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Only one candidate
            createElectionResponse = await testUtil.createElection(hostToken, {type: 'FPTP', title: 'Presidential election', candidates: ['Candidate 1']} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Title too long
            createElectionResponse = await testUtil.createElection(hostToken, {type: 'FPTP', title: 'This is the most important election of your life; nothing even comes close. Think carefully about what you choose!', candidates: ['Pineapple on pizza', 'No pineapple on pizza']} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Too many candidates
            createElectionResponse = await testUtil.createElection(hostToken, {type: 'FPTP', title: 'The next national number', candidates: [...Array(30).keys()].join().split(',')} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)

            //Candidate name is too long
            createElectionResponse = await testUtil.createElection(hostToken, {type: 'FPTP', title: 'Speaker of the painter union', candidates: ['Pablo Diego José Francisco de Paula Juan Nepomuceno Crispín Crispiniano María de los Remedios de la Santísima Trinidad Ruiz Picasso', 'Banksy']} as ElectionInfo)
            expect(createElectionResponse.status).toBe(400)
        })

        test('Can create an election with valid info', async () => {
            const createElectionResponse = await testUtil.createElection(hostToken, exampleElectionInfo)
            expect(createElectionResponse.status).toBe(200)
        })

        describe('ranked election', () => {
            test('cannot have more candidates to rank than there are candidates', async () => {
                const electionCreationResponse = await testUtil.createElection(hostToken, {type: 'ranked', title: 'Test 2024', candidates: ['Candidate 1', 'Candidate 2'], candidatesToRank: 3} as ElectionInfo)
                expect (electionCreationResponse.status).toBe(400)
            })

            test('cannot have only one candidate to rank', async () => {
                const electionCreationResponse = await testUtil.createElection(hostToken, {type: 'ranked', title: 'Test 2024', candidates: ['Candidate 1', 'Candidate 2', 'Candidate 3'], candidatesToRank: 1} as ElectionInfo)
                expect (electionCreationResponse.status).toBe(400)
            })

            test('can create a valid ranked election', async () => {
                const electionCreationResponse = await testUtil.createElection( hostToken, {type: 'ranked', title: 'Test 2024', candidates: ['Candidate 1', 'Candidate 2', 'Candidate 3'], candidatesToRank: 2} as ElectionInfo)
                expect (electionCreationResponse.status).toBe(200)
            })
        })

        test('correctly updates the lobby status', async () => {
            await testUtil.createElection(hostToken, exampleElectionInfo)

            const lobbyStatusRequest = await requestElectionStatus()
            expect(lobbyStatusRequest.body.electionActive).toBeTruthy()
        })
    })

    describe('When ending an election', () => {
        describe('with an active election', () => {
            beforeEach(async () => {
                await testUtil.createElection(hostToken, {type: 'FPTP', title: 'Test', candidates: ['Candidate 1', 'Candidate 2']})
            })

            test('cannot end an election with invalid or missing info', async () => {
                let fakeAuth = encodeObject({
                    lobbyCode: lobbyCode === '1234' ? '4321' : '1234',
                    id: hostID
                } as AuthenticationObject)

                let endElectionResponse = await testUtil.endElection(fakeAuth)
                expect(endElectionResponse.status).toBe(404)
                expect((endElectionResponse.body as ErrorMessage).type).toBe('UNAUTHORIZED')

                fakeAuth = encodeObject({
                    lobbyCode,
                    id: '11111111-1111-1111-1111-11111111111'
                } as AuthenticationObject)

                endElectionResponse = await testUtil.endElection(fakeAuth)
                expect(endElectionResponse.status).toBe(403)
                expect((endElectionResponse.body as ErrorMessage).type).toBe('UNAUTHORIZED') 
            })

            test('can end an election with valid info', async () => {
                const endElectionResponse = await testUtil.endElection(hostToken)

                expect(endElectionResponse.status).toBe(200)
            })

            test('correctly updates the lobby election status', async () => {
                await testUtil.endElection(hostToken)

                const electionStatusRequest = await requestElectionStatus()
                expect(electionStatusRequest.body.electionActive).toBeFalsy()
            })
        })

        test('cannot end an election when there is no election going on', async () => {
            const endElectionResponse = await testUtil.endElection(hostToken)

            expect(endElectionResponse.status).toBe(405)
            expect((endElectionResponse.body as ErrorMessage).type).toBe('NO_ACTIVE_ELECTION')
        })
    })

    describe('when closing a lobby', () => {
        test('cannot close lobby with invalid auth token', async () => {
            const fakeAuth = encodeObject({
                lobbyCode,
                id: '11111111-1111-1111-1111-111111111111'
            } as AuthenticationObject)

            const closeLobbyResponse = await testUtil.closeLobby(fakeAuth)
            expect(closeLobbyResponse.status).toBe(403)
        })
    })

    describe('getElectionStatus returns correct value', () => {
        test('when lobby is on standby', async () => {
            const lobbyStatusResponse = await testUtil.getElectionStatus(hostToken)
            expect(lobbyStatusResponse.status).toBe(200)
            expect(lobbyStatusResponse.body).toEqual({electionActive: false, resultsAvailable: false})
        })

        test('when an election is active', async () => {
            testUtil.createElection(hostToken, exampleElectionInfo)

            const lobbyStatusResponse = await testUtil.getElectionStatus(hostToken)
            expect(lobbyStatusResponse.body).toEqual({electionActive: true, resultsAvailable: false})
        })

        test('when an election has ended', async () => {
            testUtil.createElection(hostToken, exampleElectionInfo)
            testUtil.endElection(hostToken)

            const lobbyStatusResponse = await testUtil.getElectionStatus(hostToken)
            expect(lobbyStatusResponse.body).toEqual({electionActive: false, resultsAvailable: true})
        })
    })

    describe('getElectionResults returns correct value', () => {
        test('when no election has been created', async () => {
            const res = await testUtil.getElectionResults(hostToken)

            expect(res.status).toBe(400)
            expect((res.body as ErrorMessage).type === 'NO_ACTIVE_ELECTION').toBeTruthy()
        })

        test('when an election is active', async () => {
            await testUtil.createElection(hostToken, exampleElectionInfo)
            const res = await testUtil.getElectionResults(hostToken)

            expect(res.status).toBe(400)
            expect((res.body as ErrorMessage).type === 'NO_ACTIVE_ELECTION').toBeTruthy()
        })

        test('when an election has ended', async () => {
            await testUtil.createElection(hostToken, exampleElectionInfo)
            await testUtil.castVote(participantToken, 'JavaScript')
            await testUtil.endElection(hostToken)

            const res = await testUtil.getElectionResults(hostToken)

            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                "emptyVotes": 0,
                "title": "Which language should we use?",
                "type": "FPTP",
                "votes": {
                    "JavaScript": 1,
                    "Python": 0,
                },
            })
        })
    })
})