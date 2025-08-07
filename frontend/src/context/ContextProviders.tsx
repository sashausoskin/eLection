import { useMemo, useState } from 'react'
import { ParticipantViewTab, PopupInfo } from '../types'
import { PopupContext, SetParticipantViewContext } from './Contexts'


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

