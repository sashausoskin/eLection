import { useTranslation } from 'react-i18next'
import { ElectionResultsInfo, ResultCandidateInfo } from '../../types'

const ElectionResults = ({results} : {results: ElectionResultsInfo}) => {
    //Should this ordering be done in frontend or backend?

    const {t} = useTranslation()

    const orderedResults : ResultCandidateInfo[] = []

    Object.entries(results.votes).forEach((resultInfo, index) => {
        orderedResults.push({name: resultInfo[0], votes: resultInfo[1], position: index})
    })

    orderedResults.sort((a,b) => b.votes - a.votes)

    // This is to make sure that shared positions have the same position number
    orderedResults.forEach((result, index) => {
        let positionNumber = index + 1

        if (index > 0 && result.votes === orderedResults[index-1].votes) positionNumber = orderedResults[index - 1].position
        result.position = positionNumber
    })

    return <>
        <h1>{results.title}</h1>
        <h2 data-testid="results-header">{t('viewer.results')}</h2>

        <div className='resultsContainer'>
        {orderedResults.map((result) => {
            return <div className='candidateResultContainer' key={result.name} data-testid='result' id={`${result.name}_div`}>
                <a className='candidatePosition'>{result.position}.</a>
                <a className='candidateName'>{result.name}</a>
                <a className='candidateVotes'>{t('votes', {count: result.votes})}</a>
            </div>
        })}
        </div>
        <br />
        <a>{t('emptyVotes', {count: results.emptyVotes})}</a>
    </>
}

export default ElectionResults