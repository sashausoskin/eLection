import { useEffect, useRef, useState } from 'react'
import { createViewerSocket } from '../sockets'
import { LobbyStatusInfo } from '../types'
import ElectionInfoView from './viewer/ElectionInfo'
import ElectionResults from './viewer/ElectionResults'
import LobbyInfo from './viewer/LobbyInfo'
import Loading from '../elements/Loading'
import { useTranslation } from 'react-i18next'
import { Socket } from 'socket.io-client'
import LobbyCloseViewer from './viewer/LobbyCloseViewer'

const Viewer = () => {
    const [errorText, setErrorText] = useState<string | null>(null)
    const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo>()
    const [votesCasted, setVotesCasted] = useState<number>(0)
    const [usersInLobby, setUsersInLobby] = useState<number>(0)

    const {t} = useTranslation()

    const lobbyCode = window.localStorage.getItem('hostLobbyCode')
    const hostID = window.localStorage.getItem('hostID')
    const viewerSocket = useRef<Socket>()

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

        const handleConnect = () => {
            setErrorText(null)
        }

        const handleConnectError = (errorMsg : Error) => {
            console.error('An unexpected error occurred:', errorMsg)
            setErrorText(t('status.viewerLoadError'))
            if (viewerSocket.current) viewerSocket.current.disconnect()
        }

        const handleDisconnect = (reason : Socket.DisconnectReason) => {
            switch(reason) {
                case 'ping timeout':
                    setErrorText(t('status.serverConnectionError'))
                    break
                case 'io server disconnect':
                    console.log('Current status:', lobbyStatus?.status)
                    if (lobbyStatus?.status !== 'CLOSING') setErrorText(t('status.viewerKick'))
            }
        }

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

    }, [setErrorText, hostID, lobbyCode, t, lobbyStatus?.status])

    if (!lobbyCode || !hostID) return <a>{t('status.viewerLoadError')}</a>
    if (errorText) return <a>{errorText}</a>
    if (!lobbyStatus) return <Loading><a>{t('status.loading')}</a></Loading>

    if (lobbyStatus.status === 'STANDBY') {
        return <LobbyInfo lobbyCode={lobbyCode} usersInLobby={usersInLobby} />
    }

    else if (lobbyStatus.status === 'VOTING') {
        return <ElectionInfoView electionInfo={lobbyStatus.electionInfo} votesCasted={votesCasted} participantAmount={usersInLobby}/>
    }

    else if (lobbyStatus.status === 'ELECTION_ENDED') {
        return <ElectionResults results={lobbyStatus.results} />
    }

    else if (lobbyStatus.status === 'CLOSING') {
        return <LobbyCloseViewer lobbyStatus={lobbyStatus} />
    }
}

export default Viewer