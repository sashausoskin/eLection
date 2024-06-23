import { AxiosError } from 'axios'
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { createElection, endElection } from '../../services/lobbyHostService'
import { useEffect, useState } from 'react'
import { ElectionInfo,  ErrorMessage as ResponseErrorMessage, StatusMessage } from '../../types'

const CreateElectionForm = ({onSubmitForm, onEndElectionClick} : 
    {onSubmitForm?: ((values: ElectionInfo) => undefined),
    onEndElectionClick?: () => void}) => {

    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
    const [isElectionActive, setIsElectionActive] = useState<boolean>(false)

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
                ).min(1, 'Please enter at least one candidate')
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
                    window.alert(e.message)
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
                        window.alert('There is no election to end!')
                        setIsElectionActive(false)

                }
            }
        }
    }

    const initialValues : ElectionInfo = {
        type: 'FPTP',
        title: '',
        candidates: ['', ''],
    }

    return (
        <>
        <Formik
            initialValues ={initialValues}
            onSubmit={(values : ElectionInfo, helpers : FormikHelpers<ElectionInfo>) => onSubmitForm !== undefined ? onSubmitForm(values) : defaultOnSubmit(values, helpers)}
            validationSchema={ElectionCreationSchema}
        >
            {({ values }) => (
                <Form>
                    <Field type="radio" name="type" disabled={isElectionActive} value="FPTP" data-testid="fptp_radio"/>First-past-the-post election
                    <Field type="radio" name="type" disabled={isElectionActive} value="ranked" data-testid="ranked_radio"/>Ranked election
                    <ErrorMessage
                        name="type"
                        component="div"
                        className="field-error"
                        data-testid="radio-error"
                    />
                    <br />
                    <label htmlFor={'title'}>Title</label>
                    <Field
                        name="title"
                        data-testid="title-field"
                        placeholder="Speaker 2024"
                        disabled={isElectionActive}
                        type="text"
                    />
                    <ErrorMessage
                        name="title"
                        component="div"
                        className="field-error"
                        data-testid="title-error"
                    />
                    <FieldArray name="candidates">
                        {({ remove, push}) => (
                            <>
                            {values.candidates.length > 0 &&
                                values.candidates.map((_candidate, index) => (
                                    <div key={index}>
                                    <label htmlFor={`candidates.${index}`}>Name</label>
                                    <Field
                                        name={`candidates.${index}`} 
                                        placeholder="Barack Obama"
                                        type="string"
                                        data-testid={'candidate-field'}
                                        disabled={isElectionActive}
                                        />
                                    <ErrorMessage 
                                        name={`candidates.${index}`}
                                        component="div"
                                        data-testid="candidate-error"
                                        className="field-error"
                                    />
                                    <button type="button" disabled={values.candidates.length <= 2 || isElectionActive}onClick={() => remove(index)} data-testid="remove-candidate-button">X</button>
                                    </div>
                            ))
                            }
                            <button disabled={isElectionActive}type="button" onClick={() => push('')} data-testid="add-candidate-button">+</button>
                            </>
                        )}
                    </FieldArray>
                    <button disabled={isElectionActive} data-testid="create-election-submit" type="submit">Create</button>
                </Form>
            )}
        </Formik>
        <button type='button' data-testid="end-election-button" onClick={() => onEndElectionClick !== undefined ? onEndElectionClick() : defaultOnEndElectionClick()} disabled={!isElectionActive}>End election</button>
        {statusMessage && <a data-testid={`status-${statusMessage.status}`}style={{color: statusMessage.status === 'success' ? 'green' : 'red'}}>{statusMessage.message}</a>}
        </>
    )
}

export default CreateElectionForm