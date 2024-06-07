import { useEffect, useState } from "react"
import { createLobby } from "../services/lobbyHostService"
import { Authentication } from "./host/Authentication"

export const Host = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true)
    
    
    // Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
    useEffect(() => {
        setIsLoading(true)
        createLobby().then(() => {
            setIsLoading(false)
        })}
    , [])


    if (isLoading) return <a>Creating a lobby...</a>

    
    return <Authentication />
}