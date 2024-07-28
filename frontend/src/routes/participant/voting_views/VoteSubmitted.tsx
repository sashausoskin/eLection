import { useTranslation } from 'react-i18next'

/**
 * What the participant sees when they succesfully submitted a vote.
 */
const VoteSubmitted = () : JSX.Element => {
    const {t} = useTranslation()

    return <>
        <a data-testid="vote-submitted-header">{t('voteSubmitMessage')}</a>
    </>
}

export default VoteSubmitted