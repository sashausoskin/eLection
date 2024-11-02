import { v4 as uuidv4 } from 'uuid'
import { ElectionInfo } from '../types/lobbyTypes'
import { LobbyStatusInfo } from '../types/lobbyTypes'
import { insertToRandomIndex } from '../util/shuffle'
import { availableLobbyCodes, generateCodes, lobbyInfo, resetLobbyInfo, UserNotFound } from './db'

/**
 * Creates a new lobby
 * @returns An object containing the code of the new lobby and a generated authentication that should be used by the host.
 */
export const createNewLobby = (): {lobbyCode: string, hostID: string} => {
    const lobbyCode = availableLobbyCodes.pop()
    const hostID = uuidv4()

    const userCodes = generateCodes()


    lobbyInfo[lobbyCode] = {hostID: hostID, lastActivity: Date.now(), status: 'STANDBY', availableUserCodes: userCodes, queuedUsers: {}, participants: {}, currentVote: null, viewerSocket: null}

    return {lobbyCode, hostID}
}
/**
 * Checks if a lobby with a given code exists.
 * @param lobbyCode The code that should be validated.
 * @returns boolean
 */
export const isValidLobbyCode = (lobbyCode: string) : boolean => {
    return lobbyInfo[lobbyCode] !== undefined
}

/**
 * Gets a new user code for a lobby.
 * @param lobbyCode The lobby for which to generate a user code.
 * @returns The user code.
 */
export const getNewUserCode = (lobbyCode : string) : string => {
    const userCode = lobbyInfo[lobbyCode]['availableUserCodes'].pop()
    lobbyInfo[lobbyCode]['queuedUsers'][userCode] = null

    return userCode
}
/**
 * Checks if a user is in the queue of a lobby.
 * @param userCode The code of the user.
 * @param lobbyCode The code of the lobby.
 * @returns Is the user in queue
 */
export const isUserInQueue = (userCode : string, lobbyCode : string) : boolean => {
    return (userCode in lobbyInfo[lobbyCode]['queuedUsers'])
}

/**
 * @param lobbyCode Code of the lobby
 * @returns All of user codes queueing up for the lobby.
 */
export const getUsersInQueue = (lobbyCode : string) : string[] => {
    return Object.keys(lobbyInfo[lobbyCode]['queuedUsers'])
}

/**
 * @param lobbyCode Code of the lobby 
 * @returns All of the authentication tokens for authenticated users in the lobby.
 */
export const getParticipants = (lobbyCode : string) : string[] => {
    return Object.keys(lobbyInfo[lobbyCode]['participants'])
} 

/**
 * Creates a new ID for a participant and saves it.
 * @param lobbyCode The code of the lobby.
 * @returns The ID of the now authenticated user.
 */
export const createAuthenticatedUser = (lobbyCode : string) => {
    const newUserID = uuidv4()

    lobbyInfo[lobbyCode]['participants'][newUserID] = null

    return newUserID
}

/**
 * Checks if a person is the host of the lobby.
 * @param lobbyCode The code of the lobby.
 * @param hostID The authorization token of the user.
 * @returns boolean
 */
export const isLobbyHost = (lobbyCode : string, hostID : string) => {
    return lobbyInfo[lobbyCode]['hostID'] === hostID
}

/**
 * Removes a user from the queue.
 * @param userCode The code of the user that should be removed from the queue.
 * @param lobbyCode The code of the lobby.
 */
export const removeUserFromQueue = (lobbyCode : string, userCode: string) => {
    if (!(userCode in lobbyInfo[lobbyCode]['queuedUsers'])) {
        throw new UserNotFound('Could not find a user with given userCode')
    }

    delete lobbyInfo[lobbyCode]['queuedUsers'][userCode]
    insertToRandomIndex(lobbyInfo[lobbyCode].availableUserCodes, userCode)
}

/**
 * Checks if a user is authorised to be in the lobby.
 * @param lobbyCode The code of the lobby.
 * @param userID The authorisation token of the user.
 * @returns boolean
 */
export const isParticipant = (lobbyCode : string, userID : string) => {
    if (!(lobbyCode in lobbyInfo)) {
        return false
    }

    return userID in lobbyInfo[lobbyCode]['participants']
}
/**
 * This is mainly used for testing.
 * @returns The number of existing lobbies.
 */
export const getNumberOfLobbies = () => {
    return Object.keys(lobbyInfo).length
}

/**
 * This deletes all of the existing lobbies.
 * This is used for testing.
 * DO NOT USE IN PRODUCTION.
 */
export const resetLobbies = () => {
    resetLobbyInfo()
}

/**
 * Gets all the information of a lobby.
 * @param lobbyCode The code of the lobby.
 * @returns Lobby's information
 */
export const getLobby = (lobbyCode : string) => {
    return lobbyInfo[lobbyCode]
}
/**
 * @param lobbyCode The code of the lobby. 
 * @param isHost Is the person requiring this information the host?
 * @returns The lobby's status. See {@link LobbyStatusInfo}
 */
export const getLobbyStatus = (lobbyCode : string, isHost : boolean) : LobbyStatusInfo => {
    const status = lobbyInfo[lobbyCode].status

    switch (status) {
        case 'STANDBY': return { status }
        case 'VOTING': return {status, electionInfo: lobbyInfo[lobbyCode].currentVote.electionInfo}
        case 'ELECTION_ENDED': 
            if (isHost) return {status, results: 
            {title: lobbyInfo[lobbyCode].currentVote.electionInfo.title,
            votes: lobbyInfo[lobbyCode].currentVote.results.votes,
            type: lobbyInfo[lobbyCode].currentVote.electionInfo.type,
            emptyVotes: lobbyInfo[lobbyCode].currentVote.results.emptyVotes}, }

            return {status}
    }
} 
/**
 * @param lobbyCode The code of the lobby.
 * @returns How many users have voted in the active election.
 */
export const getNumberOfVotes = (lobbyCode : string) : number => {
    return lobbyInfo[lobbyCode].currentVote.results.usersVoted.length
}

/**
 * Sets the lobby's status as having an active election and saves the information of the election.
 * @param lobbyCode 
 * @param electionInfo 
 */
export const createElection = (lobbyCode : string, electionInfo : ElectionInfo) => {
    lobbyInfo[lobbyCode].status = 'VOTING'
    lobbyInfo[lobbyCode].currentVote = {electionInfo, results: {votes: {}, usersVoted: [], emptyVotes: 0}}

    lobbyInfo[lobbyCode].currentVote.results = {votes: {}, usersVoted: [], emptyVotes: 0}

    electionInfo.candidates.forEach((candidate) => {
        lobbyInfo[lobbyCode].currentVote.results.votes[candidate] = 0
    })
}

/**
 * Checks if there is currently an election going on in a lobby
 * @param lobbyCode The code of the lobby
 * @returns boolean
 */
export const isElectionActive = (lobbyCode : string) : boolean => {
    return lobbyInfo[lobbyCode].status === 'VOTING'
}

export const areResultsAvailable = (lobbyCode : string) : boolean => {
    return lobbyInfo[lobbyCode].status === 'ELECTION_ENDED'
}

/**
 * Sets the lobby's status as having ended an election
 * @param lobbyCode The code of the lobby.
 */
export const endElection = (lobbyCode : string) => {
    lobbyInfo[lobbyCode].status = 'ELECTION_ENDED'
}

/**
 * Assuming there is an election going on, checks if someone is on the ballot
 * @param lobbyCode The code of the lobby.
 * @param candidate The candidate which should be checked.
 * @returns boolean
 */
export const isValidCandidate = (lobbyCode : string, candidate : string) : boolean => {
        return lobbyInfo[lobbyCode].currentVote.electionInfo.candidates.includes(candidate)
}

/**
 * Assuming there is an election going, saves a number of votes to a candidate.
 * @param lobbyCode The code of the lobby.
 * @param candidate The candidate to whom the votes were casted
 * @param votes The number of votes to give to the candidate.
 */
export const castVotes = (lobbyCode : string, candidate : string | null, votes : number) => {
    if (candidate === null) {
        lobbyInfo[lobbyCode].currentVote.results.emptyVotes += votes
        return
    }

    lobbyInfo[lobbyCode].currentVote.results.votes[candidate] += votes
}

/**
 * Assuming an active election, gets the election results
 * @param lobbyCode 
 * @returns An object with the candidate name as key and the number of votes as value.
 */
export const getElectionVotes = (lobbyCode : string) => {
    return lobbyInfo[lobbyCode].currentVote.results.votes
}

/**
 * 
 * @param lobbyCode The code of the lobby where the info that a user has voted should be saved.
 * @param participantID The ID of the participant whose vote information should be saved
 * @returns How many users have voted in total
 */
export const saveUserVoted = (lobbyCode : string, participantID : string) => {
    lobbyInfo[lobbyCode].currentVote.results.usersVoted.push(participantID)
    return lobbyInfo[lobbyCode].currentVote.results.usersVoted.length
}
/**
 * Checks if a participant has voted in an active election.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @returns 
 */
export const hasUserVoted = (lobbyCode : string, participantID : string) : boolean => {
    return lobbyInfo[lobbyCode].currentVote.results.usersVoted.includes(participantID)
}

/**
 * Checks when the lobby has last been active.
 * @param lobbyCode The code of the lobby
 * @returns A {@link Date} object
 */
export const getLastActivity = (lobbyCode : string) : number => {
    return lobbyInfo[lobbyCode].lastActivity
}

/**
 * Sets when the lobby has been last active
 * @param lobbyCode The code of the lobby.
 * @param lastActivityTime The date to which the last activity time should be set. If not provided, set to
 */
export const updateLastActivity = (lobbyCode : string, lastActivityTime: number = Date.now()) => {
    lobbyInfo[lobbyCode].lastActivity = lastActivityTime
}

/**
 * Gets the activity times of all open lobbies
 * @returns Object
 */
export const getAllLobbyActivity = () : {
    /**
     * The code of the lobby
     */
    lobbyCode : string,
    /**
     * The {@link Date} on which the lobby has been last active
     */
    lastActivity: number}[] => {
        const activityArray = []
        Object.keys(lobbyInfo).forEach((lobbyCode) => {
            activityArray.push({lobbyCode, lastActivity: getLastActivity(lobbyCode)})
        })

        return activityArray
}

/**
 * Deletes a lobby and returns the lobby's code to the list of available lobby codes.
 * @param lobbyCode 
 */
export const deleteLobby = (lobbyCode : string) => {
    delete lobbyInfo[lobbyCode]
    insertToRandomIndex(availableLobbyCodes, lobbyCode)
}