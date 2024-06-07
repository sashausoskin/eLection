import { Field, Form, Formik } from "formik";
import { auhtenticateUserWithCode, getLobbyCode } from "../../services/lobbyHostService";
import * as Yup from 'yup'
import { useState } from "react";
import { StatusMessage } from "../../types";
import { AxiosError } from "axios";

export const Authentication = ({onSubmitUserCode} : {onSubmitUserCode?: Function}): React.ReactElement => {
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
    const statusMessageColor = statusMessage?.status === "success" ? "green" : "red"

    const userCodeSchema = Yup.object({
        userCode: Yup.string()
            .required('Please enter the user code')
            .matches(/^[0-9]+$/, "Please enter only digits")
            .min(4, 'Please enter a valid user code')
            .max(4, 'Please enter a valid user code')
    })

    const defaultOnSubmitUserCode = async (userCode : string) => {
        try {
            await auhtenticateUserWithCode(userCode)
            setStatusMessage({status: "success", message: "User is now authenticated!"})
        }
        catch (e){
            if (e instanceof AxiosError) {
                if (e.response?.status === 404) {
                    setStatusMessage({status: 'error', message: "Could not find a user with the given code"})
                }
                else{
                    console.error("An error occurred: ", e.response)
                }
            }
        }  
    }


    return (
    <>
        <a>Lobby code:</a>
        <a data-testid="lobbyCode">{getLobbyCode()}</a>
        <Formik
        initialValues={{userCode: ''}}
        validationSchema={userCodeSchema}
        onSubmit={(values) => {
            (onSubmitUserCode !== undefined ? onSubmitUserCode : defaultOnSubmitUserCode)(values.userCode)}}
        >
            {({errors, touched, isValid}) => (
                <Form>
                    <Field name="userCode" data-testid="userCodeField"/>
                    {statusMessage && <a data-testid={`statusMessage_${statusMessage.status}`} style={{color: statusMessageColor}}>{statusMessage.message}</a>}
                    {errors.userCode && touched.userCode ? <a data-testid="userCodeFieldError">{errors.userCode}</a> : null}
                    <button type="submit" disabled={!isValid}>
                        Submit
                    </button>
                </Form>
            )}
        </Formik>
    </>
)}