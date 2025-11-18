import { useMemo, useRef, useState } from 'react'
import { ParticipantViewTab, PopupInfo } from '../types'
import { PopupContext, SetParticipantViewContext, ToastContext } from './Contexts'
import { Toast, ToastMessage } from 'primereact/toast'


/**
 *
 * @param React.PropsWithChildren - React props
 * @returns Context provider for {@link SetParticipantViewContext}
 */

export const SetParticipantViewContextProvider = (props: React.PropsWithChildren) => {
	const [viewTab, setViewTab] = useState<ParticipantViewTab>('joinLobby')
	const contextValue = useMemo(() => ({viewTab, setViewTab}), [viewTab])

	return (
		<SetParticipantViewContext.Provider value={contextValue}>
			{props.children}
		</SetParticipantViewContext.Provider>
	)
}
/**
 * @param props - React props 
 * @returns Context provider for {@link PopupContext}
 */
export const PopupContextProvider = (props: React.PropsWithChildren) => {
	const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

	/**
	 * Creates a popup.
	 * @param popupInfo The information the popup should display. 
	 */
	const createPopup = (popupInfo: PopupInfo) => {
		setPopupInfo(popupInfo)
	}

	/**
	 * Clears the current popup. Called when the popup's confirm and cancel buttons are clicked.
	 */
	const clearPopup = () => {
		setPopupInfo(null)
	}

	const contextValue = useMemo(() => ({popupInfo, createPopup, clearPopup}), [popupInfo])

	return (
		<PopupContext.Provider value={contextValue}>
			{props.children}
		</PopupContext.Provider>
	)
}

/**
 * 
 * @param props Props and children of the context provider
 * @returns Context provider for {@link ToastContext}
 */
export const ToastContextProvider = (props: React.PropsWithChildren) => {
	const toastRef = useRef<Toast>(null)


	/**
	 * Shows a toast in the bottom-right corner of the screen. Right now only supports success and error toasts.
	 * @param message The contents and type of the toast.
	 */
	const showToast = (message: ToastMessage) => {
		if (!message.life) message.life = 5000
		toastRef.current?.show(message)

		const toastDiv = toastRef.current?.getElement()
		if (toastDiv){
			const toastElement = toastDiv.lastChild as HTMLDivElement
			toastElement.setAttribute('data-testid',`toast-${message.severity}`)
		}
	}

	const contextValue = useMemo(() => ({showToast}), [])

	return (
		<ToastContext.Provider value={contextValue}>
			<Toast ref={toastRef} position={'bottom-right'}/>
			{props.children}
		</ToastContext.Provider>
	)
}
