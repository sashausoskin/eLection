import { useContext, useEffect, useState } from 'react'
import * as lobbyService from '../services/lobbyHostService'
import { Authentication } from './host/Authentication'
import CreateElectionForm from './host/CreateElectionForm'
import { useNavigate } from 'react-router'
import linkIcon from '/img/icons/link.svg'
import './Host.css'
import Loading from '../elements/Loading'
import { PopupContext } from '../Contexts'
import { useTranslation } from 'react-i18next'

const Host = () => {
	const [lobbyCode, setLobbyCode] = useState<string | null>(null)
	const navigate = useNavigate()
	const {createPopup} = useContext(PopupContext)

	const {t} = useTranslation()

	const handleCloseLobbyClick = async () => {
		createPopup({type: 'confirm', message: t('hostInstructions.closeLobbyConfirm'), onConfirm: async () => {
			await lobbyService.closeLobby()

			createPopup({type: 'alert', message: t('hostInstructions.closeLobbyConfirmation'), onConfirm: () => {
				navigate('/')
			}})
		}})		
	}

	// Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
	// This is why lobbyCode is also saved to a state, as otherwise it may cause bugs in development mode.
	useEffect(() => {
		const initLobby = async () => {
			setLobbyCode(null)
			try {
				await lobbyService.validateInfoFromStorage()
				setLobbyCode(lobbyService.getLobbyCode())
			} catch {
				lobbyService.clearSavedInfo()
				lobbyService.createLobby().then(() => {
					setLobbyCode(lobbyService.getLobbyCode())
				})
			}
		}
		initLobby()
	}, [])

	if (lobbyCode === null) return <Loading><a>{t('loading')}</a></Loading>

	return ( 
    <>
        <Authentication lobbyCode={lobbyCode} />
		<button className='viewerOpen'onClick={() => window.open('/viewer', '_blank', 'popup=true')}>
			<img src={linkIcon} className='icon' height={20} /><p>{t('hostInstructions.openViewerWindow')}</p>
		</button>
		<hr style={{width: '100%'}}/>
        <CreateElectionForm />
		<br />
		<hr style={{width: '100%'}}/>
		<button className='closeLobby' onClick={handleCloseLobbyClick} data-testid='close-lobby'>{t('hostInstructions.closeLobby')}</button>
    </>
    )
}

export default Host