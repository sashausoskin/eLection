import { ElectionInfo } from '../../types'

const ElectionInfoView = ({electionInfo} : {electionInfo : ElectionInfo}) => {
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
    </>
}

export default ElectionInfoView