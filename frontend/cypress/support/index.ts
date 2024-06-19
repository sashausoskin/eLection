import { ElectionInfo } from '../../src/types'

export {};

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to create a lobby with an authenticated user.
			 * @example cy.dataCy('greeting')
			 */
			createLobbyAndUser(): void;
			resetServer(): void
			createElection(electionInfo: ElectionInfo): void
		}
	}
}
