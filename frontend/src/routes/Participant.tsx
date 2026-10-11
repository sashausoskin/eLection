import { use, useEffect, useState, JSX } from 'react'
import { JoinLobbyForm } from './participant/JoinLobbyForm'
import { UserCode } from './participant/UserCode'
import { SetParticipantViewContext } from '../context/Contexts'
import * as participantService from '../services/participantService'
import LobbyView from './participant/LobbyView'
import Loading from '../elements/Loading'
import { useTranslation } from 'react-i18next'

/**
 * The participant's view.
 */
const ParticipantView: () => JSX.Element = () => {
	const { viewTab, setViewTab } = use(SetParticipantViewContext)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const {t} = useTranslation()

	useEffect(() => {
		/**
		 * Checks if there are any values stored in local storage. If yes, let the user directly into the lobby.
		 */
		const validateStoredValues = async () => {
			setIsLoading(true)
			participantService.validateStoredUserValues().then(() => {
				console.log('Token valid')
				setViewTab('inLobby')
			})
				.catch((error) => {
					console.log(error)
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
		validateStoredValues()
	}, [setViewTab])

	if (isLoading) return <Loading><a>{t('status.loading')}</a></Loading>

	return (
		<div>
			{viewTab === 'joinLobby' && <JoinLobbyForm />}
			{viewTab === 'inQueue' && <UserCode />}
			{viewTab === 'inLobby' && <>
				<a data-testid="lobby-header" hidden></a>
				<LobbyView />
			</>}
		</div>
	)
}

export default ParticipantView