export class OutOfUserCodesError extends Error {
    constructor(message?:string) {
        if (message === undefined) {
            super('Ran out of user codes')
        }

        super(message)
    }
}

export class OutOfLobbyCodesError extends Error {}

export class LobbyNotFoundError extends Error {}

export class NoElectionResultsAvailable extends Error{}

export class NoActiveElectionError extends Error{}