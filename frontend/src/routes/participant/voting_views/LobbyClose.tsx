import { useNavigate } from 'react-router'
import { LobbyStatusInfo } from '../../../types'

const LobbyClose = ({lobbyInfo} : {lobbyInfo : LobbyStatusInfo}) => {
    const navigate = useNavigate()

    if (lobbyInfo.status !== 'CLOSING') return <a>An unexpected error occurred. Showing the LobbyClose view, but the received status is not 'CLOSING'</a>

    return <>
        <h2 data-testid='lobby-close-header'>Lobby closing</h2>

        {lobbyInfo.reason === 'HOST_CLOSED' && <a>The host has closed this lobby. Thank you for participating! :)</a>}
        {lobbyInfo.reason === 'INACTIVITY' && <a>This lobby has been closed due to inactivity.</a>}

        <button onClick={() => navigate('/')}>Return to main menu</button>
    </>
}

export default LobbyClose