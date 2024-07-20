import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const Home = (): React.ReactElement => {
	const { t } = useTranslation()


	return (
		<>
			<h1 data-testid="welcome-message">{t('welcomeMessage')}</h1>
			<div className='mainMenuButtonsContainer'>
				<Link data-testid="go-to-host" to='/host'>
					<button>
						{t('host')}
					</button>
				</Link>
				<Link data-testid="go-to-participate" to='/participant'>
					<button>
						{t('participate')}
					</button>
				</Link>
			</div>
		</>
	)
}
