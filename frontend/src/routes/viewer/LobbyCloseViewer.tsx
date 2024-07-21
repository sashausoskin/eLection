import { useTranslation } from 'react-i18next'
import { LobbyStatusInfo } from '../../types'

const LobbyCloseViewer = ({lobbyStatus} : {lobbyStatus : LobbyStatusInfo}) => {
    const {t} = useTranslation()

    console.log('Rendering lobby close')

    if (lobbyStatus.status !== 'CLOSING') return <></>

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