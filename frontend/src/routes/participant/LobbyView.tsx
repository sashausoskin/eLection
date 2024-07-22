import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ErrorMessage, LobbyStatusInfo } from '../../types'
import { createLobbySocket } from '../../sockets'
import * as participantService from '../../services/participantService'
import { PopupContext, SetParticipantViewContext } from '../../Contexts'
import FPTPVotingView from './voting_views/FPTPVotingView'
import { AxiosError } from 'axios'
import VoteSubmitted from './voting_views/VoteSubmitted'
import ElectionEnded from './voting_views/ElectionEnded'
import RankedElectionView from './voting_views/RankedElectionView'
import LobbyClose from './voting_views/LobbyClose'
import { Socket } from 'socket.io-client'
import Loading from '../../elements/Loading'
import { redirect } from 'react-router'
import { useTranslation } from 'react-i18next'

const LobbyView = () : JSX.Element => {
    const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo | null>(null)
    const [canSubmitVote, setCanSubmitVote] = useState<boolean>(true)
    const [hasVoted, setHasVoted] = useState<boolean>(false)
    const { setViewTab } = useContext(SetParticipantViewContext)
    const { createPopup } = useContext(PopupContext)
    const { t } = useTranslation()

    const lobbySocket = useRef<Socket>()

    const lobbyCode = participantService.getLobbyCode()
    const participantToken = participantService.getAuthToken()

    const onStatusChange = (newStatus : LobbyStatusInfo) => {
        setHasVoted(false)
        setLobbyStatus(newStatus)
    }

    const onConnectError = (err : Error) => {
        console.error('A socket error occurred:', err.message)
    }

    const onDisconnect = useCallback((reason : Socket.DisconnectReason) => {
        if (reason === 'io server disconnect') {
            if (lobbyStatus?.status !== 'CLOSING') {
                createPopup({type: 'alert', message: t('disconnectReason.kicked'), onConfirm: () => {
                    redirect('/')
                }})
            }
        }
        if (reason === 'ping timeout') {
            createPopup({type: 'alert', message: t('disconnectReason.lostConnection'), onConfirm: () => {
                redirect('/participant')
            }})
        }
    }, [createPopup, lobbyStatus?.status, t])

    // This is a bit of a hacky solution. This is to avoid dependency issues with useEffect()
    useEffect(() => {
        if (!lobbyCode || !participantToken) {
            setViewTab('joinLobby')
            return
        }

        lobbySocket.current = createLobbySocket(lobbyCode, participantToken)

        lobbySocket.current?.connect()

        const handleUnmount = () => {
            if (lobbySocket.current) lobbySocket.current.disconnect()
        }
        
        return handleUnmount
    }, [lobbyCode, participantToken, setViewTab])


    useEffect(() => {
        lobbySocket.current?.on('status-change', onStatusChange)
        lobbySocket.current?.on('connect_error', onConnectError)
        lobbySocket.current?.on('disconnect', onDisconnect)

        return () => {
            lobbySocket.current?.off('status-change', onStatusChange)
            lobbySocket.current?.off('connect_error', onConnectError)
            lobbySocket.current?.off('disconnect', onDisconnect)
        }
    }, [onDisconnect])

    

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

    switch (lobbyStatus.status) {
        case 'STANDBY' :
            return <>
            <h2  data-testid='lobby-standby-header'>{t('joinLobby.authenticated')}</h2>
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
                return <RankedElectionView electionInfo={lobbyStatus.electionInfo} onSubmitVote={onSubmitVote}/>
            }
            break

        case 'ELECTION_ENDED': 
            return <ElectionEnded />
        case 'CLOSING':
            if (lobbySocket.current) {
                lobbySocket.current.disconnect()
            }
            return <LobbyClose lobbyInfo={lobbyStatus} />
    }



    return <></>
}

export default LobbyView