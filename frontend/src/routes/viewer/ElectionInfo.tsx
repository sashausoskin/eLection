import { Trans, useTranslation } from 'react-i18next'
import { ElectionInfo } from '../../types'
import './ViewerStyle.css'

const ElectionInfoView = ({electionInfo, votesCasted, participantAmount} : {electionInfo : ElectionInfo, votesCasted: number, participantAmount : number}) => {
    const {t} = useTranslation()

    return <>
        <h1>{electionInfo.title}</h1>
        {electionInfo.type === 'FPTP' 
            && <a>{t('viewer.FPTPVotingInstructions')}</a>}
        {electionInfo.type === 'ranked' &&
            <a>{t('viewer.rankedVotingInstructions', {candidatesToRank: electionInfo.candidatesToRank})}</a>}
        <div className='candidatesContainer'>
            {electionInfo.candidates.map((candidate) => 
                <a key={candidate}>{candidate}</a>
            )}
        </div>
        <h2>{t('viewer.votingInstructions')}</h2>

        {/* This is a very convoluted way to get translations, but TypeScript, for some reason, does not allow writing values directly with components, so put all of the components in an array*/}
        
        <Trans i18nKey={'viewer.votingStats'}
            values={{votesCasted, participantAmount}}
            components={[<a className='secondaryColor' data-testid="votes-cast" />, <a/>, <a className='secondaryColor' data-testid="participant-amount">{participantAmount}</a>]}
        >
            {'<0>{{votesCasted}}</0> <1>/</1> <2>{{participantAmount}}</2> <1> votes casted</1>'}
        </Trans>
    </>
}

export default ElectionInfoView