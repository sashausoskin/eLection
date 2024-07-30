import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

/**
 * The main menu of the app.
 */
export const Home = (): JSX.Element => {
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
				<Link to='https://github.com/sonicsasha/eLection' target='_blank'>
					{t('viewSource')}
				</Link>
			</div>
		</>
	)
}
