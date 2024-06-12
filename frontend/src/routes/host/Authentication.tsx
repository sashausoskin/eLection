import { Field, Form, Formik, FormikHelpers } from 'formik'
import { auhtenticateUserWithCode } from '../../services/lobbyHostService'
import * as Yup from 'yup'
import { useState } from 'react'
import { StatusMessage } from '../../types'
import { AxiosError } from 'axios'
import { Mock } from 'vitest'

export const Authentication = ({
	lobbyCode,
	onSubmitUserCode,
}: {
	lobbyCode: string;
	onSubmitUserCode?: ((userCode: string) => never ) | Mock<string[]>;
}): React.ReactElement => {
	const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
	const statusMessageColor = statusMessage?.status === 'success' ? 'green' : 'red'

	const userCodeSchema = Yup.object({
		userCode: Yup.string()
			.required('Please enter the user code')
			.matches(/^[0-9]+$/, 'Please enter only digits')
			.min(4, 'Please enter a valid user code')
			.max(4, 'Please enter a valid user code'),
	})

	const defaultOnSubmitUserCode = async (
		userCode: string,
		actions: FormikHelpers<{ userCode: string }>
	) => {
		try {
			await auhtenticateUserWithCode(userCode)
			setStatusMessage({
				status: 'success',
				message: 'User is now authenticated!',
			})
			actions.resetForm()
		} catch (e) {
			if (e instanceof AxiosError) {
				if (e.response?.status === 404) {
					setStatusMessage({
						status: 'error',
						message: 'Could not find a user with the given code',
					})
				} else {
					console.error('An error occurred: ', e.response)
				}
			}
		}
	}

	return (
		<>
			<a>Lobby code:</a>
			<a data-testid="lobbycode">{lobbyCode}</a>
			<Formik
				initialValues={{ userCode: '' }}
				validationSchema={userCodeSchema}
				onSubmit={(values, actions) => {
					onSubmitUserCode !== undefined
						? onSubmitUserCode(values.userCode)
						: defaultOnSubmitUserCode(values.userCode, actions)
				}}
			>
				{({ errors, touched, isValid }) => (
					<Form>
						<Field name="userCode" data-testid="usercode-field" />
						{statusMessage && (
							<a
								data-testid={`status-message-${statusMessage.status}`}
								style={{ color: statusMessageColor }}
							>
								{statusMessage.message}
							</a>
						)}
						{errors.userCode && touched.userCode ? (
							<a data-testid="usercode-field-error">{errors.userCode}</a>
						) : null}
						<button type="submit" disabled={!isValid} data-testid="submit-authentication">
							Submit
						</button>
					</Form>
				)}
			</Formik>
		</>
	)
}
