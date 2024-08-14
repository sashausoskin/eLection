import { lobbyInfo } from './db'


/**
 * @param lobbyCode The code of the lobby
 * @param userCode The code of the user
 * @returns The socket ID of the user in the queue
 */

export const getUserSocketID = (lobbyCode: string, userCode: string) => {
    return lobbyInfo[lobbyCode]['queuedUsers'][userCode]
}/**
 * Saves the socket ID of a queueing user.
 * @param userCode The code of the user.
 * @param lobbyCode The code of the lobby
 * @param socketID The ID given by Socket.IO.
 */

export const assignSocketIdToQueueingUser = (userCode: string, lobbyCode: string, socketID: string) => {
    lobbyInfo[lobbyCode]['queuedUsers'][userCode] = socketID
}
/**
 * Checks if there is a socket instance connected to the queue.
 * @param lobbyCode The code of the lobby
 * @param userCode The code of the user
 * @returns Is a participant connected to the queue socket.
 */

export const isUserConnectedToQueue = (lobbyCode: string, userCode: string): boolean => {
    return (lobbyInfo[lobbyCode].queuedUsers[userCode] !== null)
}
/**
 * Save the socket ID of a viewer connected to the viewer socket.
 * @param lobbyCode The code of the lobby.
 * @param socketID The ID of the connected viewer socket.
 */
export const assignViewerSocket = (lobbyCode: string, socketID: string) => {
    lobbyInfo[lobbyCode]['viewerSocket'] = socketID
}
/**
 * @param lobbyCode The code of the lobby.
 * @returns The ID of the connected viewer socket.
 */

export const getViewerSocket = (lobbyCode: string) => {
    return lobbyInfo[lobbyCode].viewerSocket
}
/**
 * Removes the saved ID of the viewer socket.
 * @param lobbyCode The code of the lobby.
 */

export const removeViewerSocket = (lobbyCode: string) => {
    lobbyInfo[lobbyCode].viewerSocket = null
}
/**
 * Checks if an authenticated participant is currently connected to the lobby through a socket.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @returns boolean
 */

export const isParticipantConnected = (lobbyCode: string, participantID: string) => {
    return (lobbyInfo[lobbyCode]['participants'][participantID] !== null)
}
/**
 * Saves the socket ID of a connected authorized participant.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @param socketID The ID of the socket connection.
 */

export const assignSocketIDToParticipant = (lobbyCode: string, participantID: string, socketID: string) => {
    lobbyInfo[lobbyCode]['participants'][participantID] = socketID
}
/**
 * Removes the saved socket ID of an authorized participant.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 */

export const removeParticipantSocket = (lobbyCode: string, participantID: string) => {
    lobbyInfo[lobbyCode]['participants'][participantID] = null
}
/**
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @returns The socket ID of the participant.
 */

export const getParticipantSocket = (lobbyCode: string, participantID: string) => {
    return lobbyInfo[lobbyCode].participants[participantID]
}
/**
 * @param lobbyCode The code of the lobby.
 * @returns The socket ID's of all of the connected participants.
 */

export const getAllParticipantSockets = (lobbyCode: string): string[] => {
    return Object.values(lobbyInfo[lobbyCode]['participants'])
}

