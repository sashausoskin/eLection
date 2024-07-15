import { FPTPElectionInfo } from '../../../types'
import './VotingViews.css'
import { useState } from 'react'

import voteIcon from '../../../img/icons/vote.svg'

const FPTPVotingView = ({electionInfo, canSubmitVote, onSubmitVote} : {electionInfo : FPTPElectionInfo, canSubmitVote : boolean, onSubmitVote : (voteContent: string | null) => Promise<void>}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

    const handleSubmit = () => {
        console.log('submitting')
        onSubmitVote(selectedCandidate)
    }

    return<>
        <h2>{electionInfo.title}</h2>
        <div className='candidateContainer'>
            {electionInfo.candidates.map((candidate) => 
                <div key={candidate} className={`FPTPCandidate ${selectedCandidate === candidate && 'selectedCandidate'}`} data-testid='candidate-radio' onClick={() => {setSelectedCandidate(candidate)}}>
                    <img width={75} className='voteIcon' src={voteIcon} />
                    <a className='candidateName'>{candidate}</a>
                </div>
            )}
            <div className={`FPTPCandidate emptyCandidate ${selectedCandidate === null && 'selectedCandidate'}`} onClick={() => setSelectedCandidate(null)}>
                <a className='candidateName'>Vote empty </a>
            </div>
        </div>
        <button type="button" disabled={!canSubmitVote} data-testid="vote-submit" onClick={() => handleSubmit()}>Send vote</button>
    </>
}

export default FPTPVotingView
