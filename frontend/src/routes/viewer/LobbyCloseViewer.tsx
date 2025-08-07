import { useTranslation } from 'react-i18next'
import { LobbyStatusInfo } from '../../types'

/**
 * What the viewer sees when the lobby is closed.
 */
const LobbyCloseViewer = ({lobbyStatus} : {
	/**
     * The lobby's status, including information on why the lobby closed.
     */
	lobbyStatus : LobbyStatusInfo}) => {
	const {t} = useTranslation()

	// This shouldn't be possible, but just to make sure and to comply with TypeScript.
	if (lobbyStatus.status !== 'CLOSING') return <a>{t('unexpectedError', {errorMessage: 'Showing the lobby close view, even though the status isn\'t closed.'})}</a>

	return <> 
		<h2>{
			lobbyStatus.reason === 'HOST_CLOSED' ? t('lobbyClose.hostClosed')
				: lobbyStatus.reason ===  'INACTIVITY' ? t('lobbyClose.inactivity')
					: t('lobbyClose.unknown')}
		</h2>
		<a>{t('lobbyClose.footer')}</a>

	</>
}

export default LobbyCloseViewer