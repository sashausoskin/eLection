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
		<SetParticipantViewContext value={contextValue}>
			{props.children}
		</SetParticipantViewContext>
	)
};export const PopupContextProvider = (props: React.PropsWithChildren) => {
	const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

	const createPopup = (popupInfo: PopupInfo) => {
		setPopupInfo(popupInfo)
	}

	const clearPopup = () => {
		setPopupInfo(null)
	}

	const contextValue = useMemo(() => ({popupInfo, createPopup, clearPopup}), [popupInfo])

	return (
		<PopupContext value={contextValue}>
			{props.children}
		</PopupContext>
	)
}

export const ToastContextProvider = (props: React.PropsWithChildren) => {
	const toastRef = useRef<Toast>(null)

	const showToast = (message: ToastMessage) => {
		message.life = 5000
		toastRef.current?.show(message)

		const toastElement = toastRef.current?.getElement()
		if (toastElement){
			toastElement.setAttribute('data-testid',`toast-${message.severity}`)
		}
	}

	const contextValue = useMemo(() => ({showToast}), [])

	return (
		<ToastContext value={contextValue}>
			<Toast ref={toastRef} position={'bottom-right'}/>
			{props.children}
		</ToastContext>
	)
}
