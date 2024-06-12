import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers } from "formik"
import { Mock } from "vitest"
import * as Yup from 'yup'

const FTPTForm = ({onSubmitForm} : {onSubmitForm?:((values: {title: string, candidates: string[]}) => never )| Mock<any, any>}) => {

    const FTPTVoteSchema = Yup.object().shape({
        title: Yup.string()
        .required("Please enter a title for your election"),

        candidates: Yup.array()
                .of(Yup.string()
                    .required("Please enter a name for the candidate or remove the candidate")
                ).min(1, "Please enter at least one candidate")
    })

    const defaultOnSubmit = 
        (values: {title: string; candidates: string[];}, 
        formikHelpers: FormikHelpers<{title: string;candidates: string[];}>) => {
            console.log(values)
            formikHelpers.resetForm()
    }

    return (
        <Formik
            initialValues={{
                title: '',
                candidates: [''],
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
                                    <button disabled={values.candidates.length <= 1}onClick={() => remove(index)} data-testid="remove-candidate-button">X</button>
                                    </div>
                            ))
                            }
                            <button type="button" onClick={() => push('')} data-testid="add-candidate-button">+</button>
                            </>
                        )}
                    </FieldArray>
                    <button type="submit" data-testid="create-election-submit">Create</button>
                </Form>
            )}
        </Formik>
    )
}

export default FTPTForm