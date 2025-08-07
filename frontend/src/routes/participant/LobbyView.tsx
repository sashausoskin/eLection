import { useCallback, use, useEffect, useRef, useState } from 'react'
import { ErrorMessage, LobbyStatusInfo } from '../../types'
import { createLobbySocket } from '../../sockets'
import * as participantService from '../../services/participantService'
import { PopupContext, SetParticipantViewContext } from '../../context/Contexts'
import FPTPVotingView from './voting_views/FPTPVotingView'
import { AxiosError } from 'axios'
import VoteSubmitted from './voting_views/VoteSubmitted'
import ElectionEnded from './voting_views/ElectionEnded'
import RankedElectionView from './voting_views/RankedElectionView'
import LobbyClose from './voting_views/LobbyClose'
import { Socket } from 'socket.io-client'
import Loading from '../../elements/Loading'
import { Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

const LobbyView = () : JSX.Element => {
	const [connectionAttempts, setConnectionAttempts] = useState<number>(0)
	const [connectionFailed, setConnectionFailed] = useState<boolean>(false)
	const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo | null>(null)
	const [canSubmitVote, setCanSubmitVote] = useState<boolean>(true)
	const [hasVoted, setHasVoted] = useState<boolean>(false)
	const { setViewTab } = use(SetParticipantViewContext)
	const { createPopup } = use(PopupContext)
	const { t } = useTranslation()
	const navigate = useNavigate()

	const maxConnectionAttempts = 5

	const lobbySocket = useRef<Socket>()

	const participantToken = participantService.getAuthToken()

	const onStatusChange = (newStatus : LobbyStatusInfo) => {
		setHasVoted(false)
		setCanSubmitVote(true)
		setLobbyStatus(newStatus)
	}

	const onConnectError = useCallback(() => {
		if (connectionAttempts >= maxConnectionAttempts) {
			navigate('/')
			createPopup({type: 'alert', message: t('status.serverConnectionError')})
			lobbySocket.current?.disconnect()
			return
		}

		setConnectionFailed(true)
		setConnectionAttempts(connectionAttempts + 1)
		
		
	}, [createPopup, navigate, t, connectionAttempts])

	const onConnect = () => {
		setConnectionFailed(false)
		setConnectionAttempts(0)
	}

	const onDisconnect = useCallback((reason : Socket.DisconnectReason) => {
		if (reason === 'io server disconnect') {
			if (lobbyStatus?.status !== 'CLOSING') {
				createPopup({type: 'alert', message: t('disconnectReason.kicked'), onConfirm: () => {
					navigate('/')
				}})
			}
		}
		else if (reason === 'ping timeout') {
			createPopup({type: 'alert', message: t('disconnectReason.lostConnection'), onConfirm: () => {
				window.location.reload()
			}})
		}
		else if (reason === 'transport close') {
			window.location.reload()
		}

	}, [createPopup, lobbyStatus?.status, t, navigate])

	// This is a bit of a hacky solution. This is to avoid dependency issues with useEffect()
	// Handles the connection to the socket.
	useEffect(() => {
		if (!participantToken) {
			setViewTab('joinLobby')
			return
		}

		lobbySocket.current = createLobbySocket(participantToken)

		lobbySocket.current?.connect()

		const handleUnmount = () => {
			if (lobbySocket.current) lobbySocket.current.disconnect()
		}
        
		return handleUnmount
	}, [participantToken, setViewTab])

	// Assigns functions to socket events. This is done separately from the socket connection to make sure that the socket doesn't try to connect multiple times.
	// When a client socket connects to the backend, the server sends a status-change event.
	useEffect(() => {
		lobbySocket.current?.on('status-change', onStatusChange)
		lobbySocket.current?.on('connect_error', onConnectError)
		lobbySocket.current?.on('disconnect', onDisconnect)
		lobbySocket.current?.on('connect', onConnect)

		return () => {
			lobbySocket.current?.off('status-change', onStatusChange)
			lobbySocket.current?.off('connect_error', onConnectError)
			lobbySocket.current?.off('disconnect', onDisconnect)
			lobbySocket.current?.off('connect', onConnect)
		}
	}, [onDisconnect, onConnectError])

	// This adds a vibration to the user whenever a new election starts.
	useEffect(() => {
		if (lobbyStatus?.status === 'VOTING'){
			navigator.vibrate([200, 50, 200])
		}
	}, [lobbyStatus])

    
	/**
     * Handles the submission of a vote. Tries to send the vote data to the backend. If unsuccesful, triest to act according to the error message.
     * @param voteContent - Information on what the user voted for. If the active is election is FPTP, then this should be a string of the candidate the user voted for.
     *      If the active election is ranked, this should be an array of candidate names, starting with the one who receives the most votes.
     *      If null, empty vote.
     */
	const onSubmitVote = async (voteContent : string | string[] | null) => {
		setCanSubmitVote(false)
		try {
			await participantService.castVote(voteContent)
			setHasVoted(true)
		}
		catch (e) {
			if (e instanceof AxiosError) {
				switch ((e.response?.data as ErrorMessage).type) {
					case 'ALREADY_VOTED':
						createPopup({type: 'alert', message: t('status.voteAlreadySubmitted'), onConfirm: () => {
							setHasVoted(true)
						}})
						break
					case 'NO_ACTIVE_ELECTION':
						setLobbyStatus({status: 'STANDBY'})
						break
					default:
						createPopup({type: 'alert', message: `${t('unexpectedError')}: ${e.response?.data.message}`, onConfirm: () => {
							setCanSubmitVote(true)
						}})
				}
			}
		}
	}
    

	if (lobbyStatus === null) {
		return <Loading><a>{t('status.connecting')}</a></Loading>
	}

	if (connectionFailed) {
		return <>
			<span data-testid = 'lobby-reconnect'/>
			<Loading><a>{t('status.reconnecting', {currentAttempt: connectionAttempts, maxAttempts: maxConnectionAttempts})}</a></Loading>
		</>
	}

	switch (lobbyStatus.status) {
		case 'STANDBY' :
			return <>
				<h2 data-testid='lobby-standby-header'>{t('joinLobby.authenticated')}</h2>
				<a>{t('status.waitingForElection')}</a>
			</> 
        
    
		case 'VOTING':
			if (hasVoted) {
				return <VoteSubmitted />
			}
    
			if (lobbyStatus.electionInfo.type === 'FPTP') {
				return <FPTPVotingView electionInfo={lobbyStatus.electionInfo} canSubmitVote={canSubmitVote} onSubmitVote={onSubmitVote}/>
			}
			else if (lobbyStatus.electionInfo.type === 'ranked') {
				return <RankedElectionView electionInfo={lobbyStatus.electionInfo} canSubmitVote={canSubmitVote} onSubmitVote={onSubmitVote}/>
			}
			break

		case 'ELECTION_ENDED': 
			return <ElectionEnded />
		case 'CLOSING':
			lobbySocket.current?.disconnect()
			return <LobbyClose lobbyInfo={lobbyStatus} />
	}

	// If none of these views can be shown, then a weird error occurred and the user is redirected to the main menu.
	return <Navigate to={'/'} />
}

export default LobbyView