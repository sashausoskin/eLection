import { v4 as uuidv4 } from 'uuid'
import { LobbyInfo } from '../types'
import shuffleArray from '../util/shuffle'

let lobbyInfo : Record<string, LobbyInfo>  = {}
let lobbyCodeArray: string[] = []

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


    lobbyInfo[lobbyCode] = {hostID: hostID, status: 'STANDBY', availableUserCodes: userCodes}

    return {lobbyCode, hostID}
}

export const isValidLobbyCode = (lobbyCode: string) : boolean => {
    return lobbyInfo[lobbyCode] !== undefined
}

export const getNewUserCode = (lobbyCode : string) : string => {
    return lobbyInfo[lobbyCode]['availableUserCodes'].pop()
}