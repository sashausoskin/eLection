import { LobbyInfo } from '../types/lobbyTypes'
import { shuffleArray } from '../util/shuffle'


export let lobbyInfo: Record<string, LobbyInfo> = {}
export let availableLobbyCodes: string[] = []

export class UserNotFound extends Error {
}
/**
 * @returns An array of all of the possible four-digit from 0000 to 9999 codes in a random order.
 */
export const generateCodes = (): string[] => {
    return shuffleArray(
        Array.from(Array(10000).keys()).map((n) => (
            n.toString().padStart(4, '0')
        )))
}
/**
 * Populates the database with lobby codes.
 */
const populateDatabaseWithLobbyCodes = () => {
    availableLobbyCodes = generateCodes()
}

export const resetLobbyInfo = () => {
    lobbyInfo = {}
}
populateDatabaseWithLobbyCodes()
