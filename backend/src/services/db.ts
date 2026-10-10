import { LobbyInfo } from '../types/lobbyTypes'
import { shuffleArray } from '../util/shuffle'

const rawNumber = process.env.CODE_LENGTH
export const CODE_LENGTH = rawNumber === undefined ? 4 : Number(rawNumber)

if (!Number.isInteger(CODE_LENGTH) || CODE_LENGTH < 1) {
    throw new Error('The CODE_LENGTH environment variable should be a positive integer')
}

export let lobbyInfo: Map<string, LobbyInfo> = new Map()
export let availableLobbyCodes: string[] = []

export class UserNotFound extends Error {
}
/**
 * @returns An array of all of the possible CODE_LENGTH-digit codes in a random order.
 */
export const generateCodes = (): string[] => {
    return shuffleArray(
        Array.from(Array(10 ** CODE_LENGTH).keys()).map((n) => (
            n.toString().padStart(CODE_LENGTH, '0')
        )))
}
/**
 * Populates the database with lobby codes.
 */
const populateDatabaseWithLobbyCodes = () => {
    availableLobbyCodes = generateCodes()
}

export const resetLobbyInfo = () => {
    lobbyInfo = new Map()
}
populateDatabaseWithLobbyCodes()
