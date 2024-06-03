import { Socket, io } from "socket.io-client"
import { useState } from "react"
import { JoinLobbyForm } from "./participant/lobby"
import { UserCode } from "./participant/usercode"

export const ParticipantView : () => JSX.Element = () => {
    const [viewTab, setViewTab] = useState<"joinLobby" | "showCode" | "authenticated">("joinLobby")
    const [userCode, setUserCode] = useState<string | null>(null)

    const handleSubmitLobbyCode = async (lobbyCode : string) => {
        try {
            const joinSocket: Socket = io(`${import.meta.env.VITE_SOCKETIO_URI}/join`)
            joinSocket.connect()
            joinSocket.emit('connect to lobby', lobbyCode, (response : {lobbyCode: string}) => {
                if (!response.lobbyCode) {
                    console.error("Got a response from socket, but did not get a lobby code!")
                    joinSocket.disconnect()
                    return
                }
                setUserCode(response.lobbyCode)
                setViewTab('showCode')
                })
                console.log("Tried to emit")
            }
        catch (e){
            console.error(e)
        }
    }

    return (<>
        {(viewTab === 'joinLobby') &&
            <JoinLobbyForm handleSubmitLobbyCode={handleSubmitLobbyCode} />
        }
        {(viewTab === 'showCode') && userCode !== null && 
            <UserCode code={userCode} />
        }
        </>
    )
}