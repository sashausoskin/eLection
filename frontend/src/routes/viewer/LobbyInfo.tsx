const LobbyInfo = ({lobbyCode, usersInLobby} : {lobbyCode : string, usersInLobby : number}) => {
    return <>
        <h2>Welcome to vote!</h2>
        <a>Go to {window.location.host}, select "Participate" and enter the lobby code</a>
        <div className='codeDisplay'>
            <a data-testid="lobbyCode">{lobbyCode}</a>
        </div>
        <a>on your device</a>
        <a><a className='secondaryColor' data-testid="users-joined">{usersInLobby}</a> participants in lobby</a>
    </>
}

export default LobbyInfo