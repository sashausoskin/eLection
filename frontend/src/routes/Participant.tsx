import { useContext, useEffect, useState } from 'react'
import { JoinLobbyForm } from './participant/JoinLobbyForm'
import { UserCode } from './participant/UserCode'
import { SetParticipantViewContext } from '../Contexts'
import * as participantService from '../services/participantService'
import LobbyView from './participant/Lobby'

const ParticipantView: () => JSX.Element = () => {
	const { viewTab, setViewTab } = useContext(SetParticipantViewContext)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		const validateStoredValues = async () => {
			setIsLoading(true)
			try {
				participantService.loadValuesFromStorage()
				await participantService.validateStoredUserValues()
				setViewTab('inLobby')
			} catch (e) {
                true
			}
			setIsLoading(false)
		}
		validateStoredValues()
	}, [setViewTab])

	if (isLoading) return <a>Loading....</a>

	return (
		<>
			{viewTab === 'joinLobby' && <JoinLobbyForm />}
			{viewTab === 'inQueue' && <UserCode />}
			{viewTab === 'inLobby' && <>
				<a data-testid="lobby-header" hidden></a>
				<LobbyView />
				</>}
		</>
	)
}

export default ParticipantView