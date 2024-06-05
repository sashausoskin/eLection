import { useState } from "react"
import { JoinLobbyForm } from "./participant/lobby"
import { UserCode } from "./participant/usercode"
import axios, { AxiosError } from "axios"

export const ParticipantView : () => JSX.Element = () => {
    const [viewTab, setViewTab] = useState<"joinLobby" | "showCode" | "authenticated">("joinLobby")
    const [userCode, setUserCode] = useState<string | null>(null)
    const [lobbyCode, setLobbyCode] = useState<string | null>(null)

    const handleAuthentication = (userID : string) => {
        setViewTab("authenticated")
        console.log("UserID: ", userID)
    }

    const handleSubmitLobbyCode = async (lobbyCode : string) => {
        try {
            if (lobbyCode === null) return
            console.log(import.meta.env.VITE_BACKEND_URL)
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/lobby/joinLobby`,
            {params: 
                {lobbyCode}
            })

            if (response.status === 404) {
                window.alert("Did not find a lobby with the given code. Try again!")
            }

            if (!response.data['userCode']) {
                console.error("Got response for lobbyCode, but did not receive userCode!")
            }

            const userCode = response.data['userCode']

            setUserCode(userCode)
            setLobbyCode(lobbyCode)
            setViewTab('showCode')
        }
        catch (e){
            if (e instanceof AxiosError) {
                console.log(e.code)
                if (e.response?.status === 404) {
                    window.alert("No lobby was found with the given code. Please try again!")
                }
                else {
                    console.error(e.response?.data)
                }
            }
        }
    }

    return (<>
        {(viewTab === 'joinLobby') &&
            <JoinLobbyForm handleSubmitLobbyCode={handleSubmitLobbyCode} />
        }
        {(viewTab === 'showCode') && userCode !== null && lobbyCode !== null &&
            <UserCode userCode={userCode} lobbyCode={lobbyCode} onAuthenticated={handleAuthentication}/>
        }
        {(viewTab === 'authenticated') &&
            <a>You are now authenticated. Welcome! :)</a>
        }
        </>
    )
}