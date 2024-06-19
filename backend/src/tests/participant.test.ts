import request from 'supertest'
import { app } from '../util/server'
import { ElectionInfo, ErrorMessage } from '../types/types'
import * as lobbyService from '../services/lobbyservice'

describe("With an active election", () => {
    let hostID : string
    let participantID : string
    let lobbyCode : string

    beforeEach(async () => {
        lobbyService.resetLobbies()

        const lobbyCreationRequest = await request(app).post('/testing/createLobbyWithUser')
        hostID = lobbyCreationRequest.body.hostID
        participantID = lobbyCreationRequest.body.participantID
        lobbyCode = lobbyCreationRequest.body.lobbyCode

        const exampleElection : ElectionInfo = {type: "FPTP", title: "Presidential election 2024", candidates: ["Donald Trump", "Joe Biden"]}

        await request(app).post('/host/createElection')
            .set("Authorization", hostID)
            .send({lobbyCode, electionInfo: exampleElection})
    })

    test("cannot vote without an authorization token", async () => {
        const voteCastRequest = await request(app).post('/participant/castVote')
            .send({lobbyCode, voteContent: "Joe Biden"})
        
        expect(voteCastRequest.status).toBe(401)
        expect(voteCastRequest.body.type).toBe("MISSING_AUTH_TOKEN")
    })
})