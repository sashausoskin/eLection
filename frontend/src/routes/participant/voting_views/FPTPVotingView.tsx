import { Field, Form, Formik } from 'formik'
import { FPTPElectionInfo } from '../../../types'

const FPTPVotingView = ({electionInfo, canSubmitVote, onSubmitVote} : {electionInfo : FPTPElectionInfo, canSubmitVote : boolean, onSubmitVote : (voteContent: string) => Promise<void>}) => {
    const initialValues = {voteContent : ''}

    return<>
        <h2>{electionInfo.title}</h2>
        <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
            onSubmitVote(values.voteContent)
        }}
        >
            <Form>
                {electionInfo.candidates.map((candidate) => 
                    <div key={candidate} style={{backgroundColor: 'blue', display: 'flex', flexDirection: 'row', padding: '5%', margin: '10%', alignContent: 'center'}}>
                        <Field data-testid="candidate-radio" type="radio" name="voteContent" value={candidate} />
                        <a>{candidate}</a>
                    </div>
                )}
                <div style={{backgroundColor: 'blue', display: 'flex', flexDirection: 'row', alignContent: 'center'}}>
                    <Field type="radio" name="voteContent" value={''} /> Vote empty
                </div>
                <button type="submit" disabled={!canSubmitVote} data-testid="vote-submit">Send vote</button>
            </Form>
        </Formik>
    </>
}

export default FPTPVotingView
