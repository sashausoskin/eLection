import { ElectionInfo } from '../../types'

const ElectionInfoView = ({electionInfo, votesCasted, participantAmount} : {electionInfo : ElectionInfo, votesCasted: number, participantAmount : number}) => {
    console.log(electionInfo)

    return <>
        <h1>{electionInfo.title}</h1>
        {electionInfo.type === 'FPTP' 
            && <p>Select from one of the following:</p>}
        {electionInfo.candidates.map((candidate) => 
            <>
            <a>{candidate}</a>
            <br />
            </>
        )}
        <h2>Vote on your device!</h2>

        <p><a data-testid="votes-cast">{votesCasted}</a>/<a data-testid="participant-amount">{participantAmount}</a> votes casted</p>
    </>
}

export default ElectionInfoView