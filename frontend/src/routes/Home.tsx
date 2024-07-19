import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const Home = (): React.ReactElement => {
	const { t } = useTranslation()

	return (
		<>
			<h1 data-testid="welcome-message">{t('welcomeMessage')}</h1>
			<Link data-testid="go-to-host" to={'/host'}>
				{t('host')}
			</Link>
			<Link data-testid="go-to-participate" to={'/participant'}>
				{t('participate')}
			</Link>
		</>
	)
}
