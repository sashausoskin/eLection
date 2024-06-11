import { useContext, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { createLobbySocket } from "../../sockets"
import { SetParticipantViewContext } from "../../Contexts"
import { getLobbyCode, getUserCode, setAuthToken } from "../../services/participantService"

export const UserCode = ({onAuthenticated} : {onAuthenticated? : (userID: string) => void}) => {
    const lobbyCode = getLobbyCode()
    const userCode = getUserCode()

    const [isConnecting, setIsConnecting] = useState<boolean>(true)

    const {setViewTab} = useContext(SetParticipantViewContext)

    // If there isn't a lobby code or user code stored in memory, then an error occurred and the user is sent back to the lobby joining screen
    if (lobbyCode === null || userCode === null) {
        setViewTab('inLobby')
        return
    }

    const defaultOnAuthenticated = (userID : string) => {
        setAuthToken(userID)
        setViewTab('inLobby')
    }

    useEffect(() => {
        setIsConnecting(true)
        const lobbySocket : Socket = createLobbySocket(userCode, lobbyCode)
        lobbySocket.on('connect', () => {
            console.log('Connected to socket')
            setIsConnecting(false)
        })
        lobbySocket.on('error', (error)=> {
            console.error('A socket error occurred: ', error)
        })
        lobbySocket.on('authorize', ({userID}) => {
            (onAuthenticated === null ? onAuthenticated : defaultOnAuthenticated)(userID)
        })
        lobbySocket.connect()
    }, [])

    if (isConnecting) return <a>Connecting...</a>

    return (
    <>
    <a>Here is your code</a>
    <a style={{fontSize: 20}} data-testid={"userCode"}>{userCode}</a>
    <a>Show this code to the secretary</a>
    </>
    )
}