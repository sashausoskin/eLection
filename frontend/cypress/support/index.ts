import { ElectionInfo } from '../../src/types'

export {}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to create a lobby with an authenticated user.
			 * @example cy.dataCy('greeting')
			 */
			createLobbyAndUser(): void;
			resetServer(): void
			createElection(electionInfo: ElectionInfo): void
			createUser(): Cypress.Chainable<Cypress.Response<object>>
			castVote(voteContent: string | string[]): void
			endElection(): void
			getElectionResults(): Cypress.Chainable<Cypress.Response<object>>
			closeLobby(): Cypress.Chainable<Cypress.Response<object>>
			startCleanup(): Cypress.Chainable<Cypress.Response<object>>
			setLobbyLastActive(lastActiveTime : number) : Cypress.Chainable<Cypress.Response<object>>
			getNumberOfLobbies(): Cypress.Chainable<Cypress.Response<object>>
		}
	}
}
