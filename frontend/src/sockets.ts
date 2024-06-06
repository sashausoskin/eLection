import { Socket, io } from "socket.io-client";

export const createLobbySocket = (userCode : string, lobbyCode : string) : Socket => io(`${import.meta.env.VITE_BACKEND_URL}/queue`, 
        {query: 
            {"userCode": userCode, "lobbyCode": lobbyCode},
        autoConnect: false
        })