import axios, { AxiosError } from "axios"
import { Field, Form, Formik, FormikHelpers } from "formik"
import * as Yup from "yup"
import * as participantService from '../../services/participantService'
import { useContext } from "react"
import { SetParticipantViewContext } from "../../Contexts"

export const JoinLobbyForm = ({handleSubmitLobbyCode} : {handleSubmitLobbyCode?: Function}) : React.ReactElement => {

    const setViewTab = useContext(SetParticipantViewContext)

    const defaultHandleSubmitLobbyCode = async (values : {lobbyCode : string}, {setErrors} : FormikHelpers<{lobbyCode :string}>) => {
        try {
            const lobbyCode = values.lobbyCode

            if (lobbyCode === null) return
            console.log(import.meta.env.VITE_BACKEND_URL)
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/lobby/joinLobby`,
            {lobbyCode})


            if (!response.data['userCode']) {
                console.error("Got response for lobbyCode, but did not receive userCode!")
                return
            }

            const userCode = response.data['userCode']

            participantService.setUserCode(userCode)
            participantService.setLobbyCode(lobbyCode)

            if (setViewTab === null) {
                if (process.env.NODE_ENV === "development") {
                    console.error('Succesfully received userCode, but did not receive setViewTab context! Unable to change the view!')
                }
                return
            }
            setViewTab('inQueue')
        }
        catch (e){
            if (e instanceof AxiosError) {
                console.log(e.code)
                if (e.response?.status === 404) {
                    setErrors({lobbyCode: "Could not find a lobby with the given code. Please try again!"})
                }
                else {
                    console.error(e.response?.data)
                }
            }
        }}

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
            onSubmit={(values, formikHelpers) => 
                {handleSubmitLobbyCode !== undefined ? handleSubmitLobbyCode(values.lobbyCode) : defaultHandleSubmitLobbyCode(values, formikHelpers)  }}
            >
                {({ errors, touched, isValid }) => (
                    <Form>
                        <Field name="lobbyCode" data-testid="lobbyCodeField"/>
                        {errors.lobbyCode && touched.lobbyCode ? (
                            <a data-testid="lobbyCodeFieldError" style={{color: "red"}}>{errors.lobbyCode}</a>
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