const LobbyInfo = ({lobbyCode, usersInLobby} : {lobbyCode : string, usersInLobby : number}) => {
    return <div className="lobbyInfoContainer">
        <h2>Welcome to vote!</h2>
        <a>Go to {window.location.host}, select "Participate" and enter the lobby code</a>
        <div className='codeDisplay'>
            <a data-testid="lobbyCode">{lobbyCode}</a>
        </div>
        <a>on your device</a>
        <div style={{marginTop: '5%'}}>
            <a className='secondaryColor' data-testid="users-joined">{usersInLobby}</a><a> participants in lobby</a>
        </div>
    </div>
}

export default LobbyInfo