import { useState } from "react"
import { JoinLobbyForm } from "./participant/lobby"
import { UserCode } from "./participant/usercode"
import axios, { AxiosError } from "axios"

export const ParticipantView : () => JSX.Element = () => {
    const [viewTab, setViewTab] = useState<"joinLobby" | "showCode" | "authenticated">("joinLobby")
    const [userCode, setUserCode] = useState<string | null>(null)
    const [lobbyCode, setLobbyCode] = useState<string | null>(null)

    const handleSubmitLobbyCode = async (lobbyCode : string) => {
        try {
            if (lobbyCode === null) return
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/joinLobby`,
            {params: 
                {lobbyCode}
            })

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
                if (e.code === "404") {
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
            <UserCode userCode={userCode} lobbyCode={lobbyCode}/>
        }
        </>
    )
}