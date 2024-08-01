import { useTranslation } from 'react-i18next'

/**
 * What the participant sees when they succesfully submitted a vote.
 */
const VoteSubmitted = () : JSX.Element => {
    const {t} = useTranslation()

    return <>
        <h2 data-testid="vote-submitted-header">{t('voteSubmit.header')}</h2>
        <a>{t('voteSubmit.message')}</a>
    </>
}

export default VoteSubmitted