import { ElectionInfo } from '../../types'
import './ViewerStyle.css'

const ElectionInfoView = ({electionInfo, votesCasted, participantAmount} : {electionInfo : ElectionInfo, votesCasted: number, participantAmount : number}) => {
    return <>
        <h1>{electionInfo.title}</h1>
        {electionInfo.type === 'FPTP' 
            && <a>Vote for one of the following:</a>}
        {electionInfo.type === 'ranked' &&
            <a>Rank your top {electionInfo.candidatesToRank} candidates from the following:</a>}
        <div className='candidatesContainer'>
            {electionInfo.candidates.map((candidate) => 
                <a key={candidate}>{candidate}</a>
            )}
        </div>
        <h2>Vote on your device!</h2>

        <a className='secondaryColor' data-testid="votes-cast">{votesCasted}</a>
        <a>/</a>
        <a data-testid="participant-amount" className='secondaryColor'>{participantAmount}</a>
        <a> votes casted</a>
    </>
}

export default ElectionInfoView