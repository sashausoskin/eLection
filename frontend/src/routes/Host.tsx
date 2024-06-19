import { useEffect, useState } from 'react'
import * as lobbyService from '../services/lobbyHostService'
import { Authentication } from './host/Authentication'
import CreateElectionForm from './host/CreateElectionForm'

export const Host = () => {
	const [lobbyCode, setLobbyCode] = useState<string | null>(null)

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

	if (lobbyCode === null) return <a>Loading...</a>

	return ( 
    <>
        <Authentication lobbyCode={lobbyCode} />
        <CreateElectionForm />
        <button onClick={() => window.open('/viewer', '_blank', 'popup=true')}>Open the viewer window</button>
    </>
    )
}
