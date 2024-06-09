import { useState } from "react"
import { JoinLobbyForm } from "./participant/JoinLobbyForm"
import { UserCode } from "./participant/usercode"
import { SetParticipantViewContext } from "../Contexts"
import { ParticipantViewTab } from "../types"
import * as participantService from '../services/participantService'

export const ParticipantView : () => JSX.Element = () => {
    const [viewTab, setViewTab] = useState<ParticipantViewTab>("joinLobby")

    const userCode = participantService.getUserCode()
    const lobbyCode = participantService.getLobbyCode()

    const handleAuthentication = (userID : string) => {
        setViewTab("inLobby")
        console.log("UserID: ", userID)
    }

    return (<SetParticipantViewContext.Provider value={setViewTab}>
        {(viewTab === 'joinLobby') &&
            <JoinLobbyForm />
        }
        {(viewTab === 'inQueue') && userCode !== null && lobbyCode !== null &&
            <UserCode userCode={userCode} lobbyCode={lobbyCode} onAuthenticated={handleAuthentication}/>
        }
        {(viewTab === 'inLobby') &&
            <a data-testid="lobbyHeader">You are now authenticated. Welcome! :)</a>
        }
        </SetParticipantViewContext.Provider>
    )
}
