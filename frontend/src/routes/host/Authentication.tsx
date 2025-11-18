import { auhtenticateUserWithCode } from '../../services/lobbyHostService'
import { useContext, useEffect, useRef, useState, useTransition } from 'react'
import { ErrorMessage } from '../../types'
import { AxiosError } from 'axios'
import { Mock } from 'vitest'
import { useTranslation } from 'react-i18next'
import { PopupContext, ToastContext } from '../../context/Contexts'
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
	const [inputtedUserCode, setInputtedUserCode] = useState<string>('')
	const [isCheckingUserCode, startUserCodeCheck] = useTransition()
	const [userCodeError, setUserCodeError] = useState<boolean>(false)
	const otpInputRef = useRef<HTMLDivElement>(null)

	const {t} = useTranslation()
	const {createPopup} = useContext(PopupContext)
	const {showToast} = useContext(ToastContext)
	const navigate = useNavigate()

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
			showToast({
				severity: 'success',
				detail: t('status.userAuthenticated', {userCode})
			})
			setInputtedUserCode('')
		} catch (e) {
			if (e instanceof AxiosError) {
				switch((e.response?.data as ErrorMessage).type) {
					case 'NOT_FOUND': 
						showToast({
							severity: 'error',
							detail: t('status.userNotFound', {userCode}),
							closable: true
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
					invalid={userCodeError}
					value={inputtedUserCode}
					length={USER_CODE_LENGTH}
					integerOnly={true}
					className='userCodeInput'
					pt={{root: {'data-testid': 'usercode-field', ref: otpInputRef}}}
					onChange={(event) => {
						if (userCodeError) setUserCodeError(false)

						if (!event.value) return
						if (typeof event.value !== 'string') return
						setInputtedUserCode(event.value)
					}}
					disabled={isCheckingUserCode}
				/>
			</div>
		</>
	)
}
