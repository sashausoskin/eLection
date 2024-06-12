import React from 'react'
import { Link } from 'react-router-dom'

export const Home = (): React.ReactElement => {
	return (
		<>
			<h1 data-testid="welcome-message">Welcome to e-lection</h1>
			<Link data-testid="go-to-host" to={'/host'}>
				Host
			</Link>
			<Link data-testid="go-to-participate" to={'/participant'}>
				Participate
			</Link>
		</>
	)
}
