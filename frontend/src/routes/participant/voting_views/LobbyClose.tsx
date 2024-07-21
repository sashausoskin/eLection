import { useNavigate } from 'react-router'
import { LobbyStatusInfo } from '../../../types'
import { useTranslation } from 'react-i18next'

const LobbyClose = ({lobbyInfo} : {lobbyInfo : LobbyStatusInfo}) => {
    const navigate = useNavigate()
    const {t} = useTranslation()

    // This should never happen and is more for TypeScript
    if (lobbyInfo.status !== 'CLOSING') return <a>{t('unexpectedError')}: Showing the LobbyClose view, but the received status is not 'CLOSING'</a>

    return <>
        <h2 data-testid='lobby-close-header'>{t('lobbyClose.header')}</h2>

        {lobbyInfo.reason === 'HOST_CLOSED' && <a>{t('lobbyClose.hostClosed')}</a>}
        {lobbyInfo.reason === 'INACTIVITY' && <a>{t('lobbyClose.inactivity')}</a>}
        <a>{t('lobbyClose.footer')}</a>

        <button onClick={() => navigate('/')}>{t('button.returnToMainMenu')}</button>
    </>
}

export default LobbyClose