import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { PopupContext } from '../Contexts'

export const Home = (): React.ReactElement => {
	const {createPopup} = useContext(PopupContext)

	return (
		<>
			<h1 data-testid="welcome-message">Welcome to eLection</h1>
			<Link data-testid="go-to-host" to={'/host'}>
				Host
			</Link>
			<Link data-testid="go-to-participate" to={'/participant'}>
				Participate
			</Link>
			<button onClick={() => createPopup({type: 'confirm', content: 'Testing an alert', onConfirm: () => console.log('Confirmed the alert')})}>Test alert</button>
		</>
	)
}
