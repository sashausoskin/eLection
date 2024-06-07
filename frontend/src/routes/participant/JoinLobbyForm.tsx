import { Field, Form, Formik } from "formik"
import * as Yup from "yup"

export const JoinLobbyForm = ({handleSubmitLobbyCode} : {handleSubmitLobbyCode: (lobbyCode: string) => Promise<void>}) => {
    

    const lobbyFormSchema = Yup.object({
        lobbyCode: Yup.string()
            .required()
            .matches(/^[0-9]+$/, "Please enter only digits")
            .min(4, 'Please enter a valid lobby code')
            .max(4, 'Please enter a valid lobby code')
        })

    return (
        <>
            <a data-testid="lobbyFormHeader">Welcome! Enter the lobby code below</a>
            <Formik
            initialValues={{ lobbyCode: ''}}
            validationSchema={lobbyFormSchema}
            onSubmit={(values) => handleSubmitLobbyCode(values.lobbyCode)}
            >
                {({ errors, touched, isValid }) => (
                    <Form>
                        <Field name="lobbyCode" data-testid="lobbyCodeField"/>
                        {errors.lobbyCode && touched.lobbyCode ? (
                            <a data-testid="lobbyCodeFieldError">{errors.lobbyCode}</a>
                        ) : null}
                        <button type="submit" disabled={!isValid}>
                            Submit
                        </button>
                    </Form>
                )}
            </Formik>
        </>
    )
}