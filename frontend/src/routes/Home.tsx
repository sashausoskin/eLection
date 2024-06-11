import React from 'react'
import { Link } from 'react-router-dom'

export const Home = (): React.ReactElement => {
	return (
		<>
			<h1 data-testid="welcomeMessage">Welcome to e-lection</h1>
			<Link data-testid="goToHost" to={'/host'}>
				Host
			</Link>
			<Link data-testid="goToParticipate" to={'/participant'}>
				Participate
			</Link>
		</>
	)
}
