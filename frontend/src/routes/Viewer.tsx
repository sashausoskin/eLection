import { useEffect, useState } from 'react'
import { createViewerSocket } from '../sockets'
import { LobbyStatusInfo } from '../types'
import ElectionInfoView from './viewer/ElectionInfo'

const Viewer = () => {
    const [errorText, setErrorText] = useState<string | null>(null)
    const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo>()

    const lobbyCode = window.localStorage.getItem('hostLobbyCode')
    const hostID = window.localStorage.getItem('hostID')

    useEffect(() => {
        if (!lobbyCode || !hostID) {
            setErrorText('Could not load the viewercorrectly. Please first create a lobby and only then open this window')
            return
        }

        const viewerSocket = createViewerSocket(lobbyCode, hostID)

        viewerSocket.on('connect', () => {
            setErrorText(null)
        })

        viewerSocket.on('connect_error', (errorMsg) => {
            setErrorText(`An error occurred: ${errorMsg}`)
            viewerSocket.disconnect()
        })

        viewerSocket.on('disconnect', (reason) => {
            switch(reason) {
                case 'ping timeout':
                    setErrorText('Cannot connect to the server. Please check your connection and reload the page!')
                    break
                case 'io server disconnect':
                    setErrorText('You were disconnected from the server. This is probably because you opened the viewer in another tab!')
            }

        })

        viewerSocket.on('status-change', (lobbyStatus : LobbyStatusInfo) => {
            setLobbyStatus(lobbyStatus)
        })

        viewerSocket.connect()

        //This is done to circumvent a TypeScript error as writing this directly to the return value causes an error
        const disconnectFromSocket = () => {
            viewerSocket.disconnect()
        }

        return (() => disconnectFromSocket())
    }, [setErrorText, hostID, lobbyCode])

    if (!lobbyCode || !hostID) return <a>Could not load the viewer. Please make sure you are the host of an active lobby and only then open this window</a>

    if (errorText) return <a>{errorText}</a>

    if (!lobbyStatus) return <a>Loading...</a>

    if (lobbyStatus.status === 'STANDBY') {
        return <>
            <a>Go to {window.location.host}, select "Participate" and enter the lobby code</a>
            <h1 data-testid="lobbyCode">{lobbyCode}</h1>
            <a>on your device</a>
            </>
    }

    else if (lobbyStatus.status === 'VOTING') {
        return <ElectionInfoView electionInfo={lobbyStatus.currentVote} />
    }
}

export default Viewer