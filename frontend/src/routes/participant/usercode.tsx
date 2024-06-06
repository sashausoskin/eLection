import { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { createLobbySocket } from "../../sockets"

export const UserCode = ({userCode, lobbyCode, onAuthenticated} : {userCode : string, lobbyCode : string, onAuthenticated : (userID: string) => void}) => {
    const [isConnecting, setIsConnecting] = useState<boolean>(true)

    useEffect(() => {
        setIsConnecting(true)
        const lobbySocket : Socket = createLobbySocket(userCode, lobbyCode)
        lobbySocket.on('connect', () => {
            console.log('Connected to socket')
        })
        lobbySocket.on('error', ({error})=> {
            console.error('A socket error occurred: ', error)
        })
        lobbySocket.on('authorize', ({userID}) => {
            console.log("Got authentication")
            onAuthenticated(userID)
        })
        lobbySocket.connect()
        setIsConnecting(false)
    })

    if (isConnecting) return <a>Connecting...</a>

    return (
    <>
    <a>Here is your code</a>
    <a style={{fontSize: 20}}>{userCode}</a>
    <a>Show this code to the secretary</a>
    </>
    )
}