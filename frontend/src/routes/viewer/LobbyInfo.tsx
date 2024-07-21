import { Trans, useTranslation } from 'react-i18next'

const LobbyInfo = ({lobbyCode, usersInLobby} : {lobbyCode : string, usersInLobby : number}) => {
    const {t} = useTranslation()

    return <div className="lobbyInfoContainer">
        <h2>{t('viewer.welcomeMessage')}</h2>
        <Trans
            i18nKey={'viewer.joiningInformation'}
            values={{lobbyCode, domain: window.location.host}}
            components={[<a/>, <a className='codeDisplay' data-testid='lobbycode'/>]}
            >
                {'<0>Go to {{domain}}, select "Participate" and enter the lobby code</0><1>{{lobbyCode}}</1><0>on your device</0>'}
        </Trans>
        <div style={{marginTop: '5%'}}>
            <Trans
                i18nKey={'viewer.lobbyStats'}
                components={[<a className='secondaryColor' data-testid='users-joined'/>, <a />]}
                count={usersInLobby}>
                    {'<0>{{count}}<0/> <1>participants in lobby<1/>'}
            </Trans>
        </div>
    </div>
}

export default LobbyInfo