import { Trans, useTranslation } from 'react-i18next'
import { ElectionInfo } from '../../types'
import './ViewerStyle.css'

/**
 * Shows the information on an active election
 */
const ElectionInfoView = ({electionInfo, votesCasted, participantAmount} :{
	/**
     * Information on the active election.
     */
	electionInfo : ElectionInfo,
	/**
     * How many votes have been cast in the active election.
     */
	votesCasted: number,
	/**
     * How many participants there are in the active election.
     */
	participantAmount : number}) => {
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

		{/* This is a fairly convoluted way to get translations, but TypeScript, for some reason, does not allow writing values directly with components, so put all of the components in an array*/}
        
		<div>
			<Trans i18nKey={'viewer.votingStats'}
				values={{votesCasted, participantAmount}}
				components={[<a key='num-votes-casted' className='secondaryColor' data-testid="votes-cast" />, <a key='normal-text'/>, <a key='participant-number' className='secondaryColor' data-testid="participant-amount">{participantAmount}</a>]}
			>
				{'<0>{{votesCasted}}</0> <1>/</1> <2>{{participantAmount}}</2> <1> votes casted</1>'}
			</Trans>
		</div>
	</>
}

export default ElectionInfoView