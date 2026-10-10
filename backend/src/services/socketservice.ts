import { getLobby } from './lobbyservice'


/**
 * @param lobbyCode The code of the lobby
 * @param userCode The code of the user
 * @returns The socket ID of the user in the queue
 */

export const getUserSocketID = (lobbyCode: string, userCode: string) => {
    return getLobby(lobbyCode).queuedUsers.get(userCode)
}/**
 * Saves the socket ID of a queueing user.
 * @param userCode The code of the user.
 * @param lobbyCode The code of the lobby
 * @param socketID The ID given by Socket.IO.
 */

export const assignSocketIdToQueueingUser = (userCode: string, lobbyCode: string, socketID: string) => {
    getLobby(lobbyCode).queuedUsers.set(userCode, socketID)
}
/**
 * Checks if there is a socket instance connected to the queue.
 * @param lobbyCode The code of the lobby
 * @param userCode The code of the user
 * @returns Is a participant connected to the queue socket.
 */

export const isUserConnectedToQueue = (lobbyCode: string, userCode: string): boolean => {
    const socketID = getLobby(lobbyCode).queuedUsers.get(userCode)

    return socketID !== null && socketID !== undefined
}
    

/**
 * Save the socket ID of a viewer connected to the viewer socket.
 * @param lobbyCode The code of the lobby.
 * @param socketID The ID of the connected viewer socket.
 */
export const assignViewerSocket = (lobbyCode: string, socketID: string) => {
    getLobby(lobbyCode).viewerSocket = socketID
}
/**
 * @param lobbyCode The code of the lobby.
 * @returns The ID of the connected viewer socket.
 */

export const getViewerSocket = (lobbyCode: string) => {
    return getLobby(lobbyCode).viewerSocket
}
/**
 * Removes the saved ID of the viewer socket.
 * @param lobbyCode The code of the lobby.
 */

export const removeViewerSocket = (lobbyCode: string) => {
    getLobby(lobbyCode).viewerSocket = null
}
/**
 * Checks if an authenticated participant is currently connected to the lobby through a socket.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @returns boolean
 */

export const isParticipantConnected = (lobbyCode: string, participantID: string) => {
    const participantSocketId = getLobby(lobbyCode).participants.get(participantID)
    return participantSocketId !== null && participantSocketId !== undefined
}
/**
 * Saves the socket ID of a connected authorized participant.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @param socketID The ID of the socket connection.
 */

export const assignSocketIDToParticipant = (lobbyCode: string, participantID: string, socketID: string) => {
    getLobby(lobbyCode).participants.set(participantID, socketID)
}
/**
 * Removes the saved socket ID of an authorized participant.
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 */

export const removeParticipantSocket = (lobbyCode: string, participantID: string) => {
    getLobby(lobbyCode).participants.set(participantID, null)
}
/**
 * @param lobbyCode The code of the lobby.
 * @param participantID The authorization token of the participant.
 * @returns The socket ID of the participant.
 */

export const getParticipantSocket = (lobbyCode: string, participantID: string) => {
    return getLobby(lobbyCode).participants.get(participantID)
}
/**
 * @param lobbyCode The code of the lobby.
 * @returns The socket ID's of all of the connected participants.
 */

export const getAllParticipantSockets = (lobbyCode: string): string[] => {
    const lobby = getLobby(lobbyCode)

    return lobby.participants.values().filter((val) => val !== null).toArray()
}

