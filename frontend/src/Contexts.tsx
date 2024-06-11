import { Dispatch, SetStateAction, createContext, useState } from "react";
import { ParticipantViewTab } from "./types";

// The below is a workaround to avoid TypeScript's requiremenets. This context is always initialized through the provider, so this should be ok
export const SetParticipantViewContext = createContext<{viewTab : ParticipantViewTab, setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>}>(
    {} as {viewTab : ParticipantViewTab, setViewTab: Dispatch<SetStateAction<ParticipantViewTab>>}
)

export const SetParticipantViewContextProvider = (props : React.PropsWithChildren) => {
    const [viewTab, setViewTab] = useState<ParticipantViewTab>("joinLobby")

    return (
        <SetParticipantViewContext.Provider value={{viewTab, setViewTab}}>
            {props.children}
        </SetParticipantViewContext.Provider>
    )
}
