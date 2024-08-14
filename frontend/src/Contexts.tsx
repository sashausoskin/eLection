import { Dispatch, SetStateAction, createContext, useState } from 'react'
import { ParticipantViewTab, PopupInfo } from './types'

// The below is a workaround to avoid TypeScript's requiremenets. This context is always initialized through the provider, so this should be ok

/**
 * Context that controls what the user sees when they are a participant. Check type to see what values this can receive.
 */
export const SetParticipantViewContext = createContext<{
	/**
	 * What a participant sees.
	 */
	viewTab: ParticipantViewTab;
	/**
	 * Set what the participant sees
	 */
	setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>;
}>(
	{} as {
		viewTab: ParticipantViewTab;
		setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>;
	}
)

/**
 * 
 * @param React.PropsWithChildren - React props
 * @returns Context provider for {@link SetParticipantViewContext}
 */

export const SetParticipantViewContextProvider = (props: React.PropsWithChildren) => {
	const [viewTab, setViewTab] = useState<ParticipantViewTab>('joinLobby')

	return (
		<SetParticipantViewContext.Provider value={{ viewTab, setViewTab }}>
			{props.children}
		</SetParticipantViewContext.Provider>
	)
}
/**
 * Context that controls the popup that the user can see
 */
export const PopupContext = createContext<{
	/**
	 * The information for the popup.
	 */
	popupInfo: PopupInfo | null,
	/**
	 * Creates a popup that the user can see
	 * @param popupInfo Information for the popup
	 * @returns null
	 */
	createPopup: (popupInfo : PopupInfo) => void
	/**
	 * Clears the popup from the user.
	 * @returns null
	 */
	clearPopup: () => void 
		}>(
	{} as {
		popupInfo: PopupInfo,
		createPopup: (popupInfo : PopupInfo) => void,
		clearPopup: () => void
	}
		)

export const PopupContextProvider = (props: React.PropsWithChildren) => {
	const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

	const createPopup = (popupInfo : PopupInfo) => {
		setPopupInfo(popupInfo)
	}

	const clearPopup = () => {
		setPopupInfo(null)
	}

	return (
		<PopupContext.Provider value={{popupInfo, createPopup, clearPopup}}>
			{props.children}
		</PopupContext.Provider>
	)
}