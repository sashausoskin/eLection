declare global {
    namespace Express {
        interface Request {
            lobbyCode?: string
            hostID?: string
            userID?: string
        }
    }
}

export {}
