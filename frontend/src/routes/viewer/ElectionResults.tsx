import { ElectionResultsInfo, ResultCandidateInfo } from '../../types'

const ElectionResults = ({results} : {results: ElectionResultsInfo}) => {
    //Should this ordering be done in frontend or backend?

    const orderedResults : ResultCandidateInfo[] = []

    Object.entries(results.votes).forEach((resultInfo, index) => {
        orderedResults.push({name: resultInfo[0], votes: resultInfo[1], position: index})
    })

    console.log(orderedResults)
    console.log(results.votes)

    orderedResults.sort((a,b) => b.votes - a.votes)

    // This is for shared positions.
    orderedResults.forEach((result, index) => {
        let positionNumber = index + 1

        if (index > 0 && result.votes === orderedResults[index-1].votes) positionNumber = orderedResults[index - 1].position
        result.position = positionNumber
    })

    return <>
        <h1>{results.title}</h1>
        <h2 data-testid="results-header">Results</h2>

        
        {orderedResults.map((result) => {
            return <div className='candidateResultContainer' key={result.name} data-testid='result' id={`${result.name}_div`}>
                <a className='candidatePosition'>{result.position}.</a>
                <a className='candidateName'>{result.name}</a>
                <a className='candidateVotes'>{result.votes} votes</a>
            </div>
        })}
        <br />
        <a>{results.emptyVotes} empty votes</a>
    </>
}

export default ElectionResults