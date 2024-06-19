import { AxiosError } from 'axios'
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { createElection } from '../../services/lobbyHostService'
import { useEffect, useState } from 'react'
import { ElectionInfo, StatusMessage } from '../../types'

const CreateElectionForm = ({onSubmitForm} : {onSubmitForm?: ((values: ElectionInfo) => undefined)}) => {
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

    useEffect(() => {
        if (!statusMessage) return

        console.log('Setting timeout')

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
            }
            catch(e) {
                if (e instanceof AxiosError) {
                    window.alert(e.message)
                }
            }
    }

    const initialValues : ElectionInfo = {
        type: 'FPTP',
        title: '',
        candidates: ['', ''],
    }

    return (
        <Formik
            initialValues ={initialValues}
            onSubmit={(values : ElectionInfo, helpers : FormikHelpers<ElectionInfo>) => onSubmitForm !== undefined ? onSubmitForm(values) : defaultOnSubmit(values, helpers)}
            validationSchema={ElectionCreationSchema}
        >
            {({ values }) => (
                <Form>
                    <Field type="radio" name="type" value="FPTP" data-testid="fptp_radio"/>First-past-the-post election
                    <Field type="radio" name="type" value="ranked" data-testid="ranked_radio"/>Ranked election
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
                                        />
                                    <ErrorMessage 
                                        name={`candidates.${index}`}
                                        component="div"
                                        data-testid="candidate-error"
                                        className="field-error"
                                    />
                                    <button type="button" disabled={values.candidates.length <= 2}onClick={() => remove(index)} data-testid="remove-candidate-button">X</button>
                                    </div>
                            ))
                            }
                            <button type="button" onClick={() => push('')} data-testid="add-candidate-button">+</button>
                            </>
                        )}
                    </FieldArray>
                    <button data-testid="create-election-submit" type="submit">Create</button>
                    {statusMessage && <a data-testid={`status-${statusMessage.status}`}style={{color: statusMessage.status === 'success' ? 'green' : 'red'}}>{statusMessage.message}</a>}
                </Form>
            )}
        </Formik>
    )
}

export default CreateElectionForm