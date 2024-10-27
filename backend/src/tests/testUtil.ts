import { ElectionInfo } from '../types/lobbyTypes'
import request from 'supertest'
import { app } from '../util/server'
import { LobbyWithUserCreationResponse } from '../types/testTypes'

/**
 * A helper function that sends an election creation request
 */
export const createElection = async (hostToken : string, electionInfo : ElectionInfo) => {
    return request(app).post('/host/createElection')
    .set('Authorization', `Bearer ${hostToken}`)
    .send({electionInfo})
    .then()
}

/**
 * A helper function that sends a lobby joining request
 * @param lobbyCode The code of the lobby to join
 * @returns The user code generated for the user
 */
export const joinLobby = async (lobbyCode : string) => {
    return await request(app).post('/lobby/joinLobby')
        .send(lobbyCode !== undefined ? {lobbyCode} : {})
}

/**
 * A helper function that authenticated a user into a lobby
 * @param hostToken The authenticating host's token
 * @param userCode The user to authenticate
 * @returns 
 */
export const authenticateUser = async (hostToken : string, userCode : string) => {
    return request(app).post('/host/authenticateUser')
        .set(hostToken !== undefined ? 'Authorization' : 'sink', `Bearer ${hostToken}`)
        .send(userCode !== undefined ? {userCode} : {})
        .then()
}

/**
 * A helper function that sends a vote casting request
 * @param participantToken The token of the participant voting
 * @param voteContent What the user is voting for
 * @returns 
 */
export const castVote = async (participantToken : string, voteContent : string | string[] | null) => {
    return request(app).post('/participant/castVote')
        //Only set the Authorization header if the token is defined
        .set(participantToken !== undefined ? 'Authorization' : 'sink', `Bearer ${participantToken}`)

        //Same for voteContent
        .send(voteContent !== undefined ? {voteContent} : null)
        .then()
}

/**
 * A helper function that sends an election end request
 * @param hostToken The token of the host closing the election
 */
export const endElection = async (hostToken : string) => {
    return request(app).post('/host/endElection')
            .set('Authorization', `Bearer ${hostToken}`)
            .then()
}

/**
 * A helper function that sends a request to close the lobby
 * @param hostToken The token of the host that is trying to close the lobby
 * @returns 
 */
export const closeLobby = async (hostToken : string) => {
    return request(app).post('/host/closeLobby')
            .set('Authorization', `Bearer ${hostToken}`)
            .send()
            .then()
}

/**
 * A helper function that creates a lobby creation request
 * @returns Info for the created lobby
 */
export const createLobby = async () => {
    return await request(app).post('/lobby/createLobby')
        .send()
        .then()
}

/**
 * A helper function that sends a request to create a lobby with an authenticated user
 * @returns The lobby info with info for the authenticated user
 */
export const createLobbyWithUser = async () : Promise<LobbyWithUserCreationResponse> => {
    const req = await request(app).post('/testing/createLobbyWithUser')
    return req.body as LobbyWithUserCreationResponse
}

/**
 * A helper function that sends a user validation request
 * @param userToken The token of the user to validate
 * @returns 
 */
export const validateUser = async (userToken? : string) => {
    return await request(app).post('/lobby/validateUserInfo')
    .set(userToken !== undefined ? 'Authorization' : 'sink', `Bearer ${userToken}`)
    .send()
}

/**
 * A helper function that sends a host validation request
 * @param hostToken The token of the host to validate
 * @returns 
 */
export const validateHost = async (hostToken? : string) => {
    return await request(app).post('/lobby/validateHostInfo')
    .set(hostToken !== undefined ? 'Authorization' : 'sink', `Bearer ${hostToken}`)
    .send()
}