import { v4 as uuidv4 } from 'uuid'
import { ElectionInfo, LobbyInfo, LobbyStatusInfo } from '../types/types'
import shuffleArray from '../util/shuffle'

let lobbyInfo : Record<string, LobbyInfo>  = {}
let lobbyCodeArray: string[] = []

export class UserNotFound extends Error {

}

const generateCodes = () : string[] => {
    return shuffleArray(
        Array.from(Array(10000).keys()).map((n) => (
            n.toString().padStart(4, '0')
    )))
} 

// Generates an array of four-digit lobby codes, starting from 0000 to 9999
const populateDatabaseWithLobbyCodes = () => {
    lobbyCodeArray = generateCodes()
}

populateDatabaseWithLobbyCodes()

export const createNewLobby = (): {lobbyCode: string, hostID: string} => {
    const lobbyCode = lobbyCodeArray.pop()
    const hostID = uuidv4()

    const userCodes = generateCodes()


    lobbyInfo[lobbyCode] = {hostID: hostID, status: 'STANDBY', availableUserCodes: userCodes, queuedUsers: {}, participants: {}, currentVote: null, viewerSocket: null}

    return {lobbyCode, hostID}
}

export const isValidLobbyCode = (lobbyCode: string) : boolean => {
    return lobbyInfo[lobbyCode] !== undefined
}

export const getNewUserCode = (lobbyCode : string) : string => {
    const userCode = lobbyInfo[lobbyCode]['availableUserCodes'].pop()
    lobbyInfo[lobbyCode]['queuedUsers'][userCode] = null

    return userCode
}

export const isUserInQueue = (userCode : string, lobbyCode : string) : boolean => {
    return (userCode in lobbyInfo[lobbyCode]['queuedUsers'])
}

export const isUserConnectedToQueue = (lobbyCode : string, userCode: string) : boolean => {
    return (lobbyInfo[lobbyCode].queuedUsers[userCode] !== null)
}


export const getUsersInQueue = (lobbyCode : string) : string[] => {
    return Object.keys(lobbyInfo[lobbyCode]['queuedUsers'])
}

export const getParticipants = (lobbyCode : string) : string[] => {
    return Object.keys(lobbyInfo[lobbyCode]['participants'])
} 

export const assignSocketIdToQueueingUser = (userCode : string, lobbyCode : string, socketID : string) => {
    lobbyInfo[lobbyCode]['queuedUsers'][userCode] = socketID
}

export const getViewerSocket = (lobbyCode : string) => {
    return lobbyInfo[lobbyCode].viewerSocket
}

export const assignViewerSocket = (lobbyCode : string, socketID : string) => {
    lobbyInfo[lobbyCode]['viewerSocket'] = socketID
}

export const removeViewerSocket = (lobbyCode : string) => {
    lobbyInfo[lobbyCode].viewerSocket = null
}

export const deleteUserFromQueue = (userCode : string, lobbyCode : string) => {
    delete lobbyInfo[lobbyCode]['queuedUsers'][userCode]
}

export const createAuthenticatedUser = (lobbyCode : string) => {
    const newUserID = uuidv4()

    lobbyInfo[lobbyCode]['participants'][newUserID] = null

    return newUserID
}

export const isLobbyHost = (lobbyCode : string, hostID : string) => {
    return lobbyInfo[lobbyCode]['hostID'] === hostID
}

export const removeUserFromQueue = (lobbyCode : string, userCode: string) => {
    if (!(userCode in lobbyInfo[lobbyCode]['queuedUsers'])) {
        throw new UserNotFound('Could not find a user with given userCode')
    }

    delete lobbyInfo[lobbyCode]['queuedUsers'][userCode]
    //TODO: Perhaps make the function below add the user code to a random position?
    lobbyInfo[lobbyCode]['availableUserCodes'].push(userCode)
}

export const getUserSocketID = (lobbyCode : string, userCode : string) => {
    return lobbyInfo[lobbyCode]['queuedUsers'][userCode]
}

export const isParticipant = (lobbyCode : string, userID : string) => {
    if (!(lobbyCode in lobbyInfo)) {
        return false
    }

    return userID in lobbyInfo[lobbyCode]['participants']
}

export const getNumberOfLobbies = () => {
    return Object.keys(lobbyInfo).length
}

export const resetLobbies = () => {
    lobbyInfo = {}
}

export const getLobby = (lobbyCode : string) => {
    return lobbyInfo[lobbyCode]
}

export const getLobbyStatus = (lobbyCode : string) : LobbyStatusInfo => {
    const status = lobbyInfo[lobbyCode].status

    switch (status) {
        case 'STANDBY': return { status }
        case 'VOTING': return {status, electionInfo: lobbyInfo[lobbyCode].currentVote.electionInfo}
        case 'VOTING_ENDED': return {status, results: lobbyInfo[lobbyCode].currentVote.results, title: lobbyInfo[lobbyCode].currentVote.electionInfo.title}
    }


} 

export const getNumberOfVotes = (lobbyCode : string) : number => {
    return lobbyInfo[lobbyCode].currentVote.results.usersVoted.length
}

export const createElection = (lobbyCode : string, electionInfo : ElectionInfo) => {
    lobbyInfo[lobbyCode].status = 'VOTING'
    lobbyInfo[lobbyCode].currentVote = {electionInfo, results: {votes: {}, usersVoted: [], emptyVotes: 0}}



    lobbyInfo[lobbyCode].currentVote.results = {votes: {}, usersVoted: [], emptyVotes: 0}

    electionInfo.candidates.forEach((candidate) => {
        lobbyInfo[lobbyCode].currentVote.results.votes[candidate] = 0
    })
}

export const isElectionActive = (lobbyCode : string) : boolean => {
    return lobbyInfo[lobbyCode].status === 'VOTING'
}

export const isParticipantConnected = (lobbyCode : string, participantID : string) => {
    return (lobbyInfo[lobbyCode]['participants'][participantID] !== null)
}

export const assignSocketIDToParticipant = (lobbyCode : string, participantID : string, socketID : string) => {
    lobbyInfo[lobbyCode]['participants'][participantID] = socketID
}

export const removeParticipantSocket = (lobbyCode : string, participantID : string) => {
    lobbyInfo[lobbyCode]['participants'][participantID] = null
}

export const getParticipantSocket = (lobbyCode : string, participantID : string) => {
    return lobbyInfo[lobbyCode].participants[participantID]
}

export const getAllParticipantSockets = (lobbyCode : string) : string[] => {
    return Object.values(lobbyInfo[lobbyCode]['participants'])
}

export const isValidVote = (lobbyCode : string, candidate : string | string[]) : boolean => {
    if (Array.isArray(candidate)) {
        return false
    }
    else {
        return lobbyInfo[lobbyCode].currentVote.electionInfo.candidates.includes(candidate)
    }
}

export const castVotes = (lobbyCode : string, candidate : string | null, votes : number) => {
    if (candidate === null) {
        lobbyInfo[lobbyCode].currentVote.results.emptyVotes += votes
    }

    lobbyInfo[lobbyCode].currentVote.results.votes[candidate] += votes
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

export const hasUserVoted = (lobbyCode : string, participantID : string) : boolean => {
    return lobbyInfo[lobbyCode].currentVote.results.usersVoted.includes(participantID)
}