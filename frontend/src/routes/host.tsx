import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { LobbyCreationResponse, StatusMessage } from "../types"
import { apiClient } from "../util/apiClient"
import { Field, Form, Formik } from "formik"
import * as Yup from 'yup'
import { AxiosError } from "axios"
import { auhtenticateUserWithCode, setHostID, setLobbyCode } from "../services/lobbyHostService"

export const Host = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [localLobbyCode, setLocalLobbyCode] = useState<string | null>(null)
    // TODO: Redo this with reducers to support timeouts
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
    const statusMessageColor = statusMessage?.status === "success" ? "green" : "red"

    const handleUserCodeSubmission = async (userCode : string) => {
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

    const userCodeSchema = Yup.object({
        userCode: Yup.string()
            .required('Please enter the user code')
            .matches(/^[0-9]+$/, "Please enter only digits")
            .min(4, 'Please enter a valid user code')
            .max(4, 'Please enter a valid user code')
    })

    // Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
    useEffect(() => {
        setIsLoading(true)
        apiClient.post<LobbyCreationResponse>('/lobby/createLobby').then(response => {
            setLobbyCode(response.data.lobbyCode.toString())
            setLocalLobbyCode(response.data.lobbyCode.toString())
            setIsLoading(false)
            
            window.localStorage.setItem('authToken', response.data.hostID)
            setHostID(response.data.hostID)
        })}
    , [])


    if (isLoading) return <a>Creating a lobby...</a>

    return(
    <>
        <a>Lobby code: {localLobbyCode}</a>
        <Link to={"/"}>Go back home</Link>
        <Formik
        initialValues={{userCode: ''}}
        validationSchema={userCodeSchema}
        onSubmit={(values) => handleUserCodeSubmission(values.userCode)}
        >
            {({errors, touched, isValid}) => (
                <Form>
                    <Field name="userCode" />
                    {statusMessage && <a style={{color: statusMessageColor}}>{statusMessage.message}</a>}
                    {errors.userCode && touched.userCode ? <a>{errors.userCode}</a> : null}
                    <button type="submit" disabled={!isValid}>
                        Submit
                    </button>
                </Form>
            )}
        </Formik>

    </>
    )
}