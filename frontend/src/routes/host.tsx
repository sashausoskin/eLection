import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { LobbyCreationResponse } from "../types"
import { apiClient } from "../util/apiClient"

export const Host = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [lobbyCode, setLobbyCode] = useState<null | number>(null)

    // Note that the effect below is run twice in React's StrictMode. This shouldn't be a problem in production.
    useEffect(() => {
        console.log("Creating lobby...")
        setIsLoading(true)
        apiClient.post<LobbyCreationResponse>('/lobby/createLobby').then(response => {
            setIsLoading(false)
            setLobbyCode(response.data.lobbyCode)
        })}
    , [])


    if (isLoading) return <a>Creating a lobby...</a>

    return(
    <>
        <a>Lobby code: {lobbyCode}</a>
        <Link to={"/"}>Go back home</Link>
    </>
    )
}