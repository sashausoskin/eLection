import { AxiosError } from 'axios'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import * as participantService from '../../services/participantService'
import { useContext } from 'react'
import { SetParticipantViewContext } from '../../Contexts'
import { Mock } from 'vitest'
import './JoinLobbyForm.css'

export const JoinLobbyForm = ({
	handleSubmitLobbyCode,
}: {
	handleSubmitLobbyCode?: (lobbyCode: string) => never | Mock<string[]>;
}): React.ReactElement => {
	const { setViewTab } = useContext(SetParticipantViewContext)

	const defaultHandleSubmitLobbyCode = async (
		values: { lobbyCode: string },
		{ setErrors }: FormikHelpers<{ lobbyCode: string }>
	) => {
		try {
			const lobbyCode = values.lobbyCode

			if (lobbyCode === null) return

			const userCode = await participantService.joinQueue(lobbyCode)

			if (!userCode) {
				console.error('Got response for lobby code but did not receive a user code!')
				return
			}

			participantService.setUserCode(userCode)
			participantService.setLobbyCode(lobbyCode)
			setViewTab('inQueue')
		} catch (e) {
			if (e instanceof AxiosError) {
				console.log(e.code)
				if (e.response?.status === 404) {
					setErrors({
						lobbyCode: 'Could not find a lobby with the given code. Please try again!',
					})
				} else {
					console.error(e.response?.data)
				}
			}
		}
	}

	const lobbyFormSchema = Yup.object({
		lobbyCode: Yup.string()
			.required('Please enter a valid lobby code')
			.matches(/^[0-9]+$/, 'Please enter only digits')
			.min(4, 'Please enter a valid lobby code')
			.max(4, 'Please enter a valid lobby code'),
	})

	return (
		<>
			<Formik
				initialValues={{ lobbyCode: '' }}
				validationSchema={lobbyFormSchema}
				onSubmit={(values, formikHelpers) => {
					handleSubmitLobbyCode !== undefined
						? handleSubmitLobbyCode(values.lobbyCode)
						: defaultHandleSubmitLobbyCode(values, formikHelpers)
				}}
			>
				{({ errors, touched, isValid }) => (
					<>
						<Form autoComplete='off'>
							<h2 data-testid="lobby-form-header">Welcome!</h2>
							<a>Please enter a lobby code below</a>
							<br/>
							<Field name="lobbyCode" data-testid="lobbycode-field" size={4} maxLength={4} inputMode='numeric' className='lobbyCodeInput'/>
							<br/>
							{errors.lobbyCode && touched.lobbyCode ? (
							<a data-testid="lobbycode-field-error" style={{ color: 'red' }}>
								{errors.lobbyCode}
							</a>
						) : null}
						<br />
							<button type="submit" className='submitLobbyCode' disabled={!isValid}>
								Submit
							</button>
						</Form>
					</>
				)}
			</Formik>
		</>
	)
}
