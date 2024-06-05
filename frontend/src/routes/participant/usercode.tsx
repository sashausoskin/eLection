import { io } from "socket.io-client"

export const UserCode = ({userCode, lobbyCode} : {userCode : string, lobbyCode : string}) => {
    const lobbySocket = io(`${import.meta.env.VITE_BACKEND_URL}/queue`, 
        {query: 
            {"userCode": userCode, "lobbyCode": lobbyCode}
        })

    return (
    <>
    <a>Here is your code</a>
    <a style={{fontSize: 20}}>{userCode}</a>
    <a>Show this code to the secretary</a>
    </>
    )
}