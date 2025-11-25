import { AxiosError } from 'axios'
import * as participantService from '../../services/participantService'
import { use, useEffect, useState, useTransition } from 'react'
import { SetParticipantViewContext } from '../../context/Contexts'
import { Mock } from 'vitest'
import './JoinLobbyForm.css'
import { useTranslation } from 'react-i18next'
import { LOBBY_CODE_LENGTH } from '../../util/config'
import {InputOtp} from 'primereact/inputotp'
/**
 * The participant's view when they want to join a lobby
 */
export const JoinLobbyForm = ({
	handleSubmitLobbyCode,
}: {
	/**
	 * An optional function that is called when the user presses 'Submit'. If not provided, runs the default function. Currently used for unit tests 
	 * @param lobbyCode The lobby code the user entered
	 */
	handleSubmitLobbyCode?: (lobbyCode: string) => never | Mock;
}): React.ReactElement => {
	const { setViewTab } = use(SetParticipantViewContext)
	const [error, setError] = useState<string | null>(null)
	const [inputtedLobbyCode, setInputtedLobbyCode] = useState<string>('')
	const [isCheckingLobbyCode, startLobbyCodeCheck] = useTransition()
	const {t} = useTranslation()

	/**
	 * The function that is called if {@link handleSubmitLobbyCode} is not provided.
	 * Tries to contact the backend to validate if the lobby code is valid.
	 * If it is, changes the view to show the user code.
	 * @param values Values from the form
	 * @param setErrors A function provided by {@link FormikHelpers} 
	 * @returns null
	 */
	const defaultHandleSubmitLobbyCode = async (
		lobbyCode: string,
	) => {
		startLobbyCodeCheck(async () => {
			try {
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
						setError(t('fieldError.lobbyNotFound'))
						setInputtedLobbyCode('')
					} else {
						setError(t('unexpectedError', {errorMessage: e.message}))
						setInputtedLobbyCode('')
					}
				}
			}
		})
		
	}

	useEffect(() => {
		console.log('Got input code', inputtedLobbyCode)
		if (inputtedLobbyCode.length !== LOBBY_CODE_LENGTH) return

		startLobbyCodeCheck(async() =>{
			await (handleSubmitLobbyCode ? handleSubmitLobbyCode : defaultHandleSubmitLobbyCode)(inputtedLobbyCode)
		})
	}, [inputtedLobbyCode])

	return (
		<>
			<h2 data-testid="lobby-form-header">{t('welcome')}</h2>
			<a>{t('joinLobby.lobbyCodeInstructions')}</a>
			<br/>
			<div className='lobbyCodeInput'>
				<InputOtp
					name="lobbyCode"
					invalid={error !== null}
					value={inputtedLobbyCode}
					data-testid="lobbycode-field"
					length={LOBBY_CODE_LENGTH}
					integerOnly={true}
					className='lobbyCodeInput'
					pt={{root: {'data-testid': 'lobbycode-field'}}}
					onChange={(event) => {
						setError(null)

						if (!event.value) return
						if (typeof event.value !== 'string') return
						setInputtedLobbyCode(event.value)
					}}
					disabled={isCheckingLobbyCode}
				/>
			</div>
			<br/>
			{error && (
				<a data-testid="lobbycode-field-error" style={{ color: 'red' }}>
					{error}
				</a>
			)}
			<br />		
		</>
	)
}
