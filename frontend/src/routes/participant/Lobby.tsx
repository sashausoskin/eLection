import { useContext, useEffect, useState } from "react"
import { LobbyStatusInfo } from "../../types"
import { createLobbySocket } from "../../sockets"
import * as participantService from '../../services/participantService'
import { SetParticipantViewContext } from "../../Contexts"

const LobbyView = () : JSX.Element => {
    const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo | null>(null)
    const { setViewTab } = useContext(SetParticipantViewContext)

    const lobbyCode = participantService.getLobbyCode()
    const participantToken = participantService.getAuthToken()

    if (!lobbyCode || !participantToken) {
        setViewTab("joinLobby")
        return <></>
    }

    useEffect(() => {
        const lobbySocket = createLobbySocket(lobbyCode, participantToken)
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            setLobbyStatus(newStatus)
            })
        lobbySocket.on('connect_error', (err) => {
            console.error("A socket error occurred:", err.message)
        })
        lobbySocket.on('disconnect', (reason) => {
            if (reason === "io server disconnect") {
                window.alert("You were kicked out of the server. This is probably because you connected to the lobby from a different tab.")
            }
            if (reason === "ping timeout") {
                window.alert("You lost connection to the server. Please check your connection and reload the page")
            }
        })
        lobbySocket.connect()
}, [setLobbyStatus])
    

    if (lobbyStatus === null) {
        return <a>Connecting...</a>
    }

    if (lobbyStatus.status === "STANDBY") {
        return <a>Waiting for the next election...</a>
    }

    if (lobbyStatus.status === "VOTING") {
        return <>
            <a>Choose from one of the following:</a>
            {lobbyStatus.currentVote.candidates.map((candidate) => <p key={candidate}>{candidate}</p>)}

        </>
    }

    return <></>
}

export default LobbyView