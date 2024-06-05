import { io } from "socket.io-client";

export const createLobbySocket = (userCode : string, lobbyCode : string) => io(`${import.meta.env.VITE_BACKEND_URL}/queue`, 
        {query: 
            {"userCode": userCode, "lobbyCode": lobbyCode},
        autoConnect: false
        })