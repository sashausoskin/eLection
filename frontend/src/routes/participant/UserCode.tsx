import { useContext, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { createQueueSocket } from '../../sockets'
import { SetParticipantViewContext } from '../../Contexts'
import { getLobbyCode, getUserCode, setAuthToken } from '../../services/participantService'
import './UserCode.css'
import Loading from '../../elements/Loading'

export const UserCode = ({ onAuthenticated }: { onAuthenticated?: (userID: string) => void }) => {
	const [isConnecting, setIsConnecting] = useState<boolean>(true)

	const { setViewTab } = useContext(SetParticipantViewContext)

	const lobbyCode = getLobbyCode()
	const userCode = getUserCode()

	useEffect(() => {
		const defaultOnAuthenticated = (userID: string) => {
			setAuthToken(userID)
			setViewTab('inLobby')
		}

		// If there isn't a lobby code or user code stored in memory, then an error occurred and the user is sent back to the lobby joining screen
		if (lobbyCode === null || userCode === null) {
			setViewTab('joinLobby')
			return
		}

		setIsConnecting(true)
		const lobbySocket: Socket = createQueueSocket(userCode, lobbyCode)
		lobbySocket.on('connect', () => {
			setIsConnecting(false)
		})
		lobbySocket.on('error', (error) => {
			console.error('A socket error occurred: ', error)
		})
		lobbySocket.on('authorize', ({ userID }) => {
			(onAuthenticated === null ? onAuthenticated : defaultOnAuthenticated)(userID)
		})
		lobbySocket.connect()

		const handleDisconnect = () => {
			lobbySocket.disconnect()
		}

		return handleDisconnect
	}, [lobbyCode, userCode, setViewTab, onAuthenticated])

	if (isConnecting) return <Loading><a>Connecting...</a></Loading>

	return (
		<>
			<h3>Here is your user code</h3>
			<div className='codeDisplay'>
				<a data-testid={'usercode'}>
					{userCode}
				</a>
			</div>
			<h3>Show this code to the secretary</h3>
			<a>Waiting for access into the lobby...</a>
		</>
	)
}
