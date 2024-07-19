import { AxiosError } from 'axios'
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { createElection, endElection } from '../../services/lobbyHostService'
import { Fragment, useContext, useEffect, useState } from 'react'
import { ElectionInfo,  ElectionType,  ErrorMessage as ResponseErrorMessage, StatusMessage } from '../../types'
import './CreateElectionForm.css'
import InfoTooltip from '../../elements/Tooltip'
import trashIcon from '../../img/icons/trash.svg'
import addIcon from '../../img/icons/add.svg'
import { PopupContext } from '../../Contexts'

const CreateElectionForm = ({onSubmitForm, onEndElectionClick} : 
    {onSubmitForm?: ((values: ElectionInfo) => undefined),
    onEndElectionClick?: () => void}) => {

    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
    const [electionType, setElectionType] = useState<ElectionType>('FPTP')
    const [isElectionActive, setIsElectionActive] = useState<boolean>(false)
    const {createPopup} = useContext(PopupContext)

    useEffect(() => {
        if (!statusMessage) return

        const timeout = setTimeout(() => {
            setStatusMessage(null)
        }, 5000)

        // This clears the timeout when the component is unmounted
        return () => clearTimeout(timeout)

    }, [statusMessage])

    const ElectionCreationSchema = Yup.object().shape({
        type: Yup.string()
        .required(),

        title: Yup.string()
        .required('Please enter a title for your election'),

        candidates: Yup.array()
                .of(Yup.string()
                    .required('Please enter a name for the candidate or remove the candidate')
                ).min(1, 'Please enter at least one candidate'),
        
        candidatesToRank: Yup.number()
                .min(2, 'You have to rank at least 2 candidates. Otherwise, select FPTP election.')
    })

    const defaultOnSubmit = 
        async (values: ElectionInfo, 
        formikHelpers: FormikHelpers<ElectionInfo>) => {
            try {
                await createElection(values)
                formikHelpers.resetForm()
                setStatusMessage({status: 'success', message: 'Succesfully created the election'})
                setIsElectionActive(true)
            }
            catch(e) {
                if (e instanceof AxiosError) {
                    createPopup({type: 'alert', message: `An unexpected error occurred: ${e.message}`})
                }
            }
    }

    const defaultOnEndElectionClick = async () => {
        try {
            await endElection()
            setIsElectionActive(false)
            setStatusMessage({status: 'success', message: 'Ended the election'})
        }
        catch (e) {
            if (e instanceof AxiosError) {
                switch((e.response?.data as ResponseErrorMessage).type) {
                    case 'NO_ACTIVE_ELECTION':
                        createPopup({type: 'alert', message: 'There is no election to end!', onConfirm: () => {
                            setIsElectionActive(false)
                        }})
                }
            }
        }
    }

    const initialFPTPValues : ElectionInfo = {
        type: 'FPTP',
        title: '',
        candidates: ['', ''],
    }

    const initialRankedValues : ElectionInfo = {
        type: 'ranked',
        title: '',
        candidates: ['', ''],
        candidatesToRank: 2
    }

    return (
        <>
        <h3>Create an election</h3>
        <Formik
            // Creating different initial values is to avoid problems with TypeScript, since the Formik function inherit the types from the initial values object.
            initialValues ={electionType === 'FPTP' ? initialFPTPValues : electionType === 'ranked' ? initialRankedValues : initialFPTPValues}
            onSubmit={(values : ElectionInfo, helpers : FormikHelpers<ElectionInfo>) => onSubmitForm !== undefined ? onSubmitForm(values) : defaultOnSubmit(values, helpers)}
            validationSchema={ElectionCreationSchema}
            enableReinitialize={true}
        >
            {({ values }) => (<>
                <div className='electionTypeSelector'>
                    <input type="radio" name="type" defaultChecked={electionType === 'FPTP'} onClick={() => setElectionType('FPTP')} value={'FPTP'} disabled={isElectionActive} data-testid="fptp-radio"/>
                    First-past-the-post election
                    <InfoTooltip>
                        <a>Participants can only cast a single vote.</a>
                    </InfoTooltip>
                    <input type="radio" name="type" defaultChecked={electionType === 'ranked'} onClick={() => setElectionType('ranked')} value={'ranked'} disabled={isElectionActive} data-testid="ranked-radio"/>Ranked election
                    <InfoTooltip>
                        <a>Participants have to rank a number of candidates. The higher the rank, the more votes the candidate receives.</a>
                    </InfoTooltip>
                </div>
                <Form autoComplete='off'>
                    <ErrorMessage
                        name="type"
                        component="div"
                        className="field-error"
                        data-testid="radio-error"
                    />
                    <br />
                    <div className='inputRow'>
                        <div className='leftAlign'>
                            <label htmlFor={'title'}>Title</label>
                        </div>
                        <div className='centerFill' >
                            <Field
                                name="title"
                                data-testid="title-field"
                                placeholder="Speaker 2024"
                                disabled={isElectionActive}
                                type="text"
                            />
                        </div>
                        <div className='rightAlign' />
                    </div>
                    <ErrorMessage
                        name="title"
                        component="div"
                        className="field-error"
                        data-testid="title-error"
                    />
                    {values.type === 'ranked' && <>
                        <div className='inputRow'>
                            <div className='leftAlign'>
                                <label htmlFor='candidatesToRank'>Candidates to rank</label>
                            </div>
                            <div className='centerFill'>
                                <Field
                                name="candidatesToRank"
                                data-testid="candidates-to-rank"
                                disabled={isElectionActive}
                                type="number"
                                min={2}
                                max={values.candidates.length}
                                />
                            </div>
                            <div className='rightAlign'>
                                <InfoTooltip>
                                    <a>This determines how many candidates the participant should put in their top order. For example, if there are 3 candidates and the user has to rank 2 candidates, one candidate will receive 2 votes and another candidate 1 vote. The value has to be at least 2 and cannot be more than the number of candidates.</a>
                                </InfoTooltip>
                            </div>
                        </div>
                    </> 
                    }
                    <h3>Candidates</h3>
                    <FieldArray name="candidates">
                        {({ remove, push}) => {
                            const canDeleteCandidate = values.candidates.length <= 2 || isElectionActive

                            return <>
                            {values.candidates.length > 0 &&
                                values.candidates.map((_candidate, index) => (
                                    <Fragment key={`candidate_${index}`}>
                                    <div className='inputRow' key={index}>
                                        <div className='leftAlign'>
                                            <label htmlFor={`candidates.${index}`}>Name</label>
                                        </div>
                                        <div className='centerFill'>
                                            <Field
                                                name={`candidates.${index}`} 
                                                placeholder="Barack Obama"
                                                type="string"
                                                data-testid={'candidate-field'}
                                                disabled={isElectionActive}
                                                />
                                        </div>
                                        <div className='rightAlign'>
                                            <button tabIndex={-1} type="button" className='deleteCandidateButton' disabled={canDeleteCandidate} onClick={() => remove(index)} data-testid="remove-candidate-button">
                                                <img src={trashIcon} width={20} className={`icon ${canDeleteCandidate && 'disabledIcon'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <ErrorMessage 
                                        name={`candidates.${index}`}
                                        component="div"
                                        data-testid="candidate-error"
                                        className="field-error"
                                    />
                                    </Fragment>
                            ))
                            }
                            <button className={'addCandidateButton '} disabled={isElectionActive}type="button" onClick={() => push('')} data-testid="add-candidate-button">
                                <img className={`icon ${isElectionActive && 'disabledIcon'}`} src={addIcon} height={30} />
                            </button>
                            </>
                        }}
                    </FieldArray>
                    <div className='electionControl'>
                        <button disabled={isElectionActive} data-testid="create-election-submit" type="submit">Create election</button>
                        <button type='button' data-testid="end-election-button" onClick={() => onEndElectionClick !== undefined ? onEndElectionClick() : defaultOnEndElectionClick()} disabled={!isElectionActive}>End election</button>
                    </div>
                </Form>
                </>)}
        </Formik>
        
        {statusMessage && <a data-testid={`status-${statusMessage.status}`}style={{color: statusMessage.status === 'success' ? 'green' : 'red'}}>{statusMessage.message}</a>}
        </>
    )
}

export default CreateElectionForm