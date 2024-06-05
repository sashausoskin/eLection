import { v4 as uuidv4 } from 'uuid'
import { LobbyInfo } from '../types'
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


    lobbyInfo[lobbyCode] = {hostID: hostID, status: 'STANDBY', availableUserCodes: userCodes, queuedUsers: {}, participants: {}}

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

export const assignSocketIdToUser = (userCode : string, lobbyCode : string, socketID : string) => {
    if (lobbyInfo[lobbyCode]['queuedUsers'][userCode] !== null) {
        throw new Error('Another user has already connected with the given user code')
    }

    lobbyInfo[lobbyCode]['queuedUsers'][userCode] = socketID
}

export const createAuthenticatedUser = (lobbyCode : string) => {
    const newUserID = uuidv4()

    lobbyInfo[lobbyCode]['participants'][newUserID] = null

    return newUserID
}

export const isLobbyHost = (lobbyCode : string, hostID) => {
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