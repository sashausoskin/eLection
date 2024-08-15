import { useCallback, useEffect, useRef, useState } from 'react'
import { createViewerSocket } from '../sockets'
import { LobbyStatusInfo } from '../types'
import ElectionInfoView from './viewer/ElectionInfo'
import ElectionResults from './viewer/ElectionResults'
import LobbyInfo from './viewer/LobbyInfo'
import Loading from '../elements/Loading'
import { useTranslation } from 'react-i18next'
import { Socket } from 'socket.io-client'
import LobbyCloseViewer from './viewer/LobbyCloseViewer'
import * as hostService from '../services/lobbyHostService'

/**
 * The viewer's view. The viewer is a separate window that the host opens to a separate window and, for example, displays on a projector.
 */
const Viewer = () => {
	const [errorText, setErrorText] = useState<string | null>(null)
	const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo>()
	const [votesCasted, setVotesCasted] = useState<number>(0)
	const [usersInLobby, setUsersInLobby] = useState<number>(0)

	const {t} = useTranslation()
	hostService.loadStoredValues()
	const lobbyCode = hostService.getLobbyCode()
	const hostID = hostService.getAuthToken()
	const viewerSocket = useRef<Socket>()

	const handleConnect = () => {
		setErrorText(null)
	}

	const handleConnectError = useCallback((errorMsg : Error) => {
		console.error('An unexpected error occurred:', errorMsg)
		setErrorText(t('status.viewerLoadError'))
		if (viewerSocket.current) viewerSocket.current.disconnect()
	}, [t])

	const handleDisconnect = useCallback((reason : Socket.DisconnectReason) => {
		switch(reason) {
		case 'ping timeout':
			setErrorText(t('status.serverConnectionError'))
			break
		case 'io server disconnect':
			console.log('Current status:', lobbyStatus?.status)
			if (lobbyStatus?.status !== 'CLOSING') setErrorText(t('status.viewerKick'))
		}
	}, [lobbyStatus?.status, t])

	const handleStatusChange = (lobbyStatus : LobbyStatusInfo) => {
		if (lobbyStatus.status === 'ELECTION_ENDED') setVotesCasted(0)
		setLobbyStatus(lobbyStatus)
	}

	const handleUserJoin = (userNumber : number) => {
		setUsersInLobby(userNumber)
	}

	const handleVoteCast = (votesCasted : number) => {
		setVotesCasted(votesCasted)
	}

	useEffect(() => {
		if (!lobbyCode || !hostID) return

		viewerSocket.current = createViewerSocket(lobbyCode, hostID)
		viewerSocket.current.connect()

		return (() => {
			if (viewerSocket.current) viewerSocket.current.disconnect()
		})
	}, [hostID, lobbyCode])

	useEffect(() => {
		if (!viewerSocket.current) return

		viewerSocket.current.on('connect', handleConnect)
		viewerSocket.current.on('connect_error', handleConnectError)
		viewerSocket.current.on('status-change', handleStatusChange)
		viewerSocket.current.on('disconnect', handleDisconnect)
		viewerSocket.current.on('user-joined', handleUserJoin)
		viewerSocket.current.on('vote-casted', handleVoteCast)

		return (() => {
			if (!viewerSocket.current) return
			viewerSocket.current.removeAllListeners()
		})

	}, [handleConnectError, handleDisconnect])

	if (!lobbyCode || !hostID) return <a>{t('status.viewerLoadError')}</a>
	if (errorText) return <a>{errorText}</a>
	if (!lobbyStatus) return <Loading><a>{t('status.loading')}</a></Loading>

	switch (lobbyStatus.status) {
	case 'STANDBY':
		return <LobbyInfo lobbyCode={lobbyCode} usersInLobby={usersInLobby} />
	case 'VOTING':
		return <ElectionInfoView electionInfo={lobbyStatus.electionInfo} votesCasted={votesCasted} participantAmount={usersInLobby}/>
	case 'ELECTION_ENDED':
		return <ElectionResults results={lobbyStatus.results} />
	case 'CLOSING':
		return <LobbyCloseViewer lobbyStatus={lobbyStatus} />
	}
}

export default Viewer