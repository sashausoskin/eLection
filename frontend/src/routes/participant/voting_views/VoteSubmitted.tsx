import { useTranslation } from 'react-i18next'

const VoteSubmitted = () : JSX.Element => {
    const {t} = useTranslation()

    return <>
        <a data-testid="vote-submitted-header">{t('voteSubmitMessage')}</a>
    </>
}

export default VoteSubmitted