import { useEffect, useState } from "react"
import { createViewerSocket } from "../sockets"
import { LobbyStatusInfo } from "../types"

const Viewer = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [statusText, setStatusText] = useState<string | null>(null)

    const lobbyCode = window.localStorage.getItem('hostLobbyCode')
    const hostID = window.localStorage.getItem('hostID')

    useEffect(() => {
        if (!lobbyCode || !hostID) {
            setStatusText("Could not load the viewercorrectly. Please first create a lobby and only then open this window")
            return
        }

        const viewerSocket = createViewerSocket(lobbyCode, hostID)

        viewerSocket.on('connect', () => {
            setLoading(false)
        })

        viewerSocket.on('connect_error', (errorMsg) => {
            setStatusText(`An error occurred: ${errorMsg}`)
            viewerSocket.disconnect()
        })

        viewerSocket.on('statusChange', (lobbyStatus : LobbyStatusInfo) => {
            console.log("Succesfully connected to the server!")
            if (lobbyStatus.status === "STANDBY") {
                console.log("Lobby is on standby")
            }
        })

        console.log('Connecting...')
        viewerSocket.connect()
    }, [setLoading, setStatusText, hostID, lobbyCode])

    if (!lobbyCode || !hostID) return <a>Could not load the viewer. Please make sure you are the host of an active lobby and only then open this window</a>

    if (statusText) return <a>{statusText}</a>

    if (loading) return <a>Loading...</a>

    return <>
        <a>Enter the lobby code</a>
        <h1>{lobbyCode}</h1>
        <a>on your device</a>
        </>
}

export default Viewer