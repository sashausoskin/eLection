import { useContext, useEffect, useState } from 'react'
import { JoinLobbyForm } from './participant/JoinLobbyForm'
import { UserCode } from './participant/UserCode'
import { SetParticipantViewContext } from '../Contexts'
import * as participantService from '../services/participantService'

export const ParticipantView: () => JSX.Element = () => {
	const { viewTab, setViewTab } = useContext(SetParticipantViewContext)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		const validateStoredValues = async () => {
			setIsLoading(true)
			try {
				participantService.loadValuesFromStorage()
				await participantService.validateStoredUserValues()
				console.log('Values are valid')
				setViewTab('inLobby')
			} catch (e) {
				participantService.clearValues()
			}
			setIsLoading(false)
		}
		validateStoredValues()
	})

	if (isLoading) return <a>Loading....</a>

	return (
		<>
			{viewTab === 'joinLobby' && <JoinLobbyForm />}
			{viewTab === 'inQueue' && <UserCode />}
			{viewTab === 'inLobby' && (
				<a data-testid="lobbyHeader">You are now authenticated. Welcome! :)</a>
			)}
		</>
	)
}
