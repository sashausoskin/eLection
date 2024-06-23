import { ElectionResultsInfo, ResultCandidateInfo } from '../../types'

const ElectionResults = ({results} : {results: ElectionResultsInfo}) => {
    //Should this ordering be done in frontend or backend?

    const orderedResults : ResultCandidateInfo[] = []

    Object.entries(results.votes).forEach((resultInfo) => {
        orderedResults.push({name: resultInfo[0], votes: resultInfo[1]})
    })

    orderedResults.sort((a,b) => a.votes + b.votes)

    return <>
        <h1>{results.title}</h1>
        <h2 data-testid="results-header">Results</h2>

        {orderedResults.map((result, index) => (
            <div id={`${result.name}_div`}>
            <a id={result.name}>{index +1}. {result.name}: {result.votes} votes</a>
            </div>
        ))}
        <br />
        <a>{results.emptyVotes} empty votes</a>
    </>
}

export default ElectionResults