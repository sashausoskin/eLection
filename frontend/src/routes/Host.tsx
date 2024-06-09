import { useEffect, useState } from "react"
import { createLobby, getLobbyCode } from "../services/lobbyHostService"
import { Authentication } from "./host/Authentication"

export const Host = () => {

    const [lobbyCode, setLobbyCode] = useState<string | null>(null)
    
    
    // Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
    useEffect(() => {
        setLobbyCode(null)
        createLobby().then(() => {
            setLobbyCode(getLobbyCode())
        })}
    , [])


    if (lobbyCode === null) return <a>Creating a lobby...</a>

    
    return <Authentication lobbyCode={lobbyCode}/>
}