import { useContext, useEffect, useState } from 'react'
import { ErrorMessage, LobbyStatusInfo } from '../../types'
import { createLobbySocket } from '../../sockets'
import * as participantService from '../../services/participantService'
import { SetParticipantViewContext } from '../../Contexts'
import FPTPVotingView from './voting_views/FPTPVotingView'
import { AxiosError } from 'axios'
import VoteSubmitted from './voting_views/VoteSubmitted'
import ElectionEnded from './voting_views/ElectionEnded'

const LobbyView = () : JSX.Element => {
    const [lobbyStatus, setLobbyStatus] = useState<LobbyStatusInfo | null>(null)
    const [canSubmitVote, setCanSubmitVote] = useState<boolean>(true)
    const [hasVoted, setHasVoted] = useState<boolean>(false)
    const { setViewTab } = useContext(SetParticipantViewContext)


    useEffect(() => {
        const lobbyCode = participantService.getLobbyCode()
        const participantToken = participantService.getAuthToken()
    
        if (!lobbyCode || !participantToken) {
            setViewTab('joinLobby')
            return
        }
    
        const lobbySocket = createLobbySocket(lobbyCode, participantToken)
        lobbySocket.on('status-change', (newStatus : LobbyStatusInfo) => {
            setHasVoted(false)
            setLobbyStatus(newStatus)
            })
        lobbySocket.on('connect_error', (err) => {
            console.error('A socket error occurred:', err.message)
        })
        lobbySocket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                window.alert('You were kicked out of the server. This is probably because you connected to the lobby from a different tab.')
            }
            if (reason === 'ping timeout') {
                window.alert('You lost connection to the server. Please check your connection and reload the page')
            }
        })
        lobbySocket.connect()
}, [setLobbyStatus, setViewTab])

    const onSubmitVote = async (voteContent : string | string[]) => {
        setCanSubmitVote(false)
        try {
            await participantService.castVote(voteContent)
            setHasVoted(true)
        }
        catch (e) {
            if (e instanceof AxiosError) {
                switch ((e.response?.data as ErrorMessage).type) {
                    case 'ALREADY_VOTED':
                        setHasVoted(true)
                        window.alert('You have already submitted your vote!')
                        break
                    case 'NO_ACTIVE_ELECTION':
                        setLobbyStatus({status: 'STANDBY'})
                        break
                    default:
                        window.alert(`An unexpected error occurred when submitting vote: ${e.response?.data.message}`)
                        setCanSubmitVote(true)

                }
            }
        }
    }
    

    if (lobbyStatus === null) {
        return <a>Connecting...</a>
    }

    switch (lobbyStatus.status) {
        case 'STANDBY' :
            return <a>Waiting for the next election...</a>
        
    
        case 'VOTING':
            if (hasVoted) {
                return <VoteSubmitted />
            }
    
            if (lobbyStatus.electionInfo.type === 'FPTP') {
                return <FPTPVotingView electionInfo={lobbyStatus.electionInfo} canSubmitVote={canSubmitVote} onSubmitVote={onSubmitVote}/>
            }
            break

        case 'ELECTION_ENDED': 
            return <ElectionEnded />
    }



    return <></>
}

export default LobbyView