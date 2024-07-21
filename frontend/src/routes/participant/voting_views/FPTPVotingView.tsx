import { FPTPElectionInfo } from '../../../types'
import './VotingViews.css'
import { useState } from 'react'

import voteIcon from '/img/icons/vote.svg'
import { useTranslation } from 'react-i18next'

const FPTPVotingView = ({electionInfo, canSubmitVote, onSubmitVote} : {electionInfo : FPTPElectionInfo, canSubmitVote : boolean, onSubmitVote : (voteContent: string | null) => Promise<void>}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
    const {t} = useTranslation()

    const handleSubmit = () => {
        console.log('submitting')
        onSubmitVote(selectedCandidate)
    }

    return<>
        <h2>{electionInfo.title}</h2>
        <a className='secondaryColor votingInstructions'>{t('electionType.fptp.votingInstructions')}</a>
        <div className='candidateContainer'>
            {electionInfo.candidates.map((candidate) => 
                <div key={candidate} className={`FPTPCandidate ${selectedCandidate === candidate && 'selectedCandidate'}`} data-testid='candidate-radio' onClick={() => {setSelectedCandidate(candidate)}}>
                    <img width={75} className='voteIcon' src={voteIcon} />
                    <a className='candidateName'>{candidate}</a>
                </div>
            )}
            <div className={`FPTPCandidate emptyCandidate ${selectedCandidate === null && 'selectedCandidate'}`} onClick={() => setSelectedCandidate(null)}>
                <a className='candidateName'>{t('button.empty')}</a>
            </div>
        </div>
        <button type="button" disabled={!canSubmitVote} data-testid="vote-submit" onClick={() => handleSubmit()}>{t('button.sendVote')}</button>
    </>
}

export default FPTPVotingView
