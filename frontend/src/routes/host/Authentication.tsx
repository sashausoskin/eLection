import { auhtenticateUserWithCode } from '../../services/lobbyHostService'
import { use, useEffect, useRef, useState, useTransition } from 'react'
import { ErrorMessage, StatusMessage } from '../../types'
import { AxiosError } from 'axios'
import { Mock } from 'vitest'
import { useTranslation } from 'react-i18next'
import { PopupContext } from '../../context/Contexts'
import { useNavigate } from 'react-router'
import './Authentication.css'
import { InputOtp } from 'primereact/inputotp'
import { USER_CODE_LENGTH } from '../../util/config'

/**
 * A form that allows the host to let people into the lobby.
 */
export const Authentication = ({
	lobbyCode,
	onSubmitUserCode,
}: {
	lobbyCode: string;
	/**
	 * If provided, this is a function that will be called instead of the default function. Right now used only for unit tests.
	 */
	onSubmitUserCode?: ((userCode: string) => never ) | Mock;
}): React.ReactElement => {
	const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
	const [inputtedUserCode, setInputtedUserCode] = useState<string>('')
	const [isCheckingUserCode, startUserCodeCheck] = useTransition()
	const otpInputRef = useRef<HTMLDivElement>(null)

	const {t} = useTranslation()
	const {createPopup} = use(PopupContext)
	const navigate = useNavigate()

	useEffect(() => {
		// When the status message changes, make the message disappear after a certain time.
		if (!statusMessage) return

		const timeout = setTimeout(() => {
			setStatusMessage(null)
		}, 5000)

		// This clears the timeout when the component is unmounted
		return () => clearTimeout(timeout)

	}, [statusMessage])

	/**
	 * Called when the host presses 'Submit' if {@link onSubmitUserCode} was not provided.
	 * @param userCode - The user code that should be authenticated.
	 */
	const defaultOnSubmitUserCode = async (
		userCode: string,
	) => {
		if (userCode.length !== USER_CODE_LENGTH) return

		try {
			await auhtenticateUserWithCode(userCode)
			setStatusMessage({
				status: 'success',
				message: t('status.userAuthenticated'),
			})
			setInputtedUserCode('')
		} catch (e) {
			if (e instanceof AxiosError) {
				switch((e.response?.data as ErrorMessage).type) {
					case 'NOT_FOUND': 
						setStatusMessage({
							status: 'error',
							message: t('status.userNotFound'),
						})
						setInputtedUserCode('')
						break
					case 'UNAUTHORIZED':
					// If the host is no longer authorized, it probably means that the lobby has closed and the lobby is redirected to the main menu.
						createPopup({type: 'alert', message: t('status.unauthorisedHost'), onConfirm: () => {
							navigate('/')
						}})
						break
					default:
						console.error(t('unexpectedError'), e.response)
				}
			}
		}
		if (otpInputRef.current?.firstChild instanceof HTMLInputElement) {
			otpInputRef.current?.firstChild?.focus()
		}
	}

	useEffect(() => {
		if (inputtedUserCode.length !== USER_CODE_LENGTH) return

		// Do not make multiple checks at once. This is also to avoid React Strict Mode's restrictions
		if (isCheckingUserCode) return

		startUserCodeCheck(async () => {
			(onSubmitUserCode ? onSubmitUserCode : defaultOnSubmitUserCode)(inputtedUserCode)
		})
	}, [inputtedUserCode])

	return (
		<>
			<h2>{t('lobbyCode')}:</h2>
			<h2 className='lobbyCodeDisplay' data-testid="lobbycode">{lobbyCode}</h2>
			<p>{t('hostInstructions.userAuthentication')}</p>
			<div className='userCodeField'>
				<InputOtp
					name="lobbyCode"
					invalid={statusMessage !== null && statusMessage.status === 'error'}
					value={inputtedUserCode}
					length={USER_CODE_LENGTH}
					integerOnly={true}
					className='userCodeInput'
					pt={{root: {'data-testid': 'usercode-field', ref: otpInputRef}}}
					onChange={(event) => {
						setStatusMessage(null)

						if (!event.value) return
						if (typeof event.value !== 'string') return
						setInputtedUserCode(event.value)
					}}
					disabled={isCheckingUserCode}
				/>
			</div>
			{statusMessage && (
				<a
					data-testid={`status-message-${statusMessage.status}`}
					style={{ color: statusMessage.status === 'success' ? 'var(--confirm-button-color)' : 'var(--cancel-button-color)' }}
				>
					{statusMessage.message}
				</a>
			)}
		</>
	)
}
