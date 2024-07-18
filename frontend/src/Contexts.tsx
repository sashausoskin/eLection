import { Dispatch, SetStateAction, createContext, useState } from 'react'
import { ParticipantViewTab, PopupInfo } from './types'

// The below is a workaround to avoid TypeScript's requiremenets. This context is always initialized through the provider, so this should be ok
export const SetParticipantViewContext = createContext<{
	viewTab: ParticipantViewTab;
	setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>;
}>(
	{} as {
		viewTab: ParticipantViewTab;
		setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>;
	}
)

export const SetParticipantViewContextProvider = (props: React.PropsWithChildren) => {
	const [viewTab, setViewTab] = useState<ParticipantViewTab>('joinLobby')

	return (
		<SetParticipantViewContext.Provider value={{ viewTab, setViewTab }}>
			{props.children}
		</SetParticipantViewContext.Provider>
	)
}

export const PopupContext = createContext<{
	popupInfo: PopupInfo | null,
	createPopup: (popupInfo : PopupInfo) => void
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