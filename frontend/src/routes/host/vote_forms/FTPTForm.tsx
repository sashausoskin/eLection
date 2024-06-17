import { AxiosError } from "axios"
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers } from "formik"
import { Mock } from "vitest"
import * as Yup from 'yup'
import { createElection } from "../../../services/lobbyHostService"
import { useEffect, useState } from "react"
import { StatusMessage } from "../../../types"

const FTPTForm = ({onSubmitForm} : {onSubmitForm?:((values: {title: string, candidates: string[]}) => never )| Mock<any, any>}) => {
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

    useEffect(() => {
        if (!statusMessage) return

        console.log("Setting timeout")

        const timeout = setTimeout(() => {
            setStatusMessage(null)
        }, 5000)

        // This clears the timeout when the component is unmounted
        return () => clearTimeout(timeout)

    }, [statusMessage])

    const FTPTVoteSchema = Yup.object().shape({
        title: Yup.string()
        .required("Please enter a title for your election"),

        candidates: Yup.array()
                .of(Yup.string()
                    .required("Please enter a name for the candidate or remove the candidate")
                ).min(1, "Please enter at least one candidate")
    })

    const defaultOnSubmit = 
        async (values: {title: string; candidates: string[];}, 
        formikHelpers: FormikHelpers<{title: string;candidates: string[];}>) => {
            try {
                await createElection({type: "FPTP", ...values})
                formikHelpers.resetForm()
                setStatusMessage({status: "success", message: "Succesfully created the election"})
            }
            catch(e) {
                if (e instanceof AxiosError) {
                    window.alert(e.message)
                }
            }
    }

    return (
        <Formik
            initialValues={{
                title: '',
                candidates: ['', ''],
            }}
            onSubmit={(values, helpers) => onSubmitForm !== undefined ? onSubmitForm(values) : defaultOnSubmit(values, helpers)}
            validationSchema={FTPTVoteSchema}
        >
            {({ values }) => (
                <Form>
                    <a data-testid="ftpt_form" />
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
                                        data-testid="candidate-field"
                                        />
                                    <ErrorMessage 
                                        name={`candidates.${index}`}
                                        component="div"
                                        data-testid="candidate-error"
                                        className="field-error"
                                    />
                                    <button disabled={values.candidates.length <= 2}onClick={() => remove(index)} data-testid="remove-candidate-button">X</button>
                                    </div>
                            ))
                            }
                            <button type="button" onClick={() => push('')} data-testid="add-candidate-button">+</button>
                            </>
                        )}
                    </FieldArray>
                    <button type="submit" data-testid="create-election-submit">Create</button>
                    {statusMessage && <a style={{color: statusMessage.status === "success" ? "green" : "red"}}>{statusMessage.message}</a>}
                </Form>
            )}
        </Formik>
    )
}

export default FTPTForm