import { expect } from 'chai'

beforeEach(() => {
	cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/reset`)
})

describe('Main menu', () => {
	beforeEach(() => {
		cy.visit('/')
	})

	it('user can get to the main menu', () => {
		cy.get('[data-testid="welcome-message"]')
	})

	it('can change language', () => {
		const finnishWelcome = 'Tervetuloa eLection-palveluun!'
		const englishWelcome = 'Welcome to eLection!'

		cy.get('[data-testid="language-selector"]').select('FI')
		cy.get('[data-testid="welcome-message"]').contains(finnishWelcome)
		cy.get('[data-testid="welcome-message"]').should('not.contain', englishWelcome)

		cy.get('[data-testid="language-selector"]').select('EN')
		cy.get('[data-testid="welcome-message"]').contains(englishWelcome)
		cy.get('[data-testid="welcome-message"]').should('not.contain', finnishWelcome)
	})

	it('user can get to host view', () => {
		cy.get('[data-testid="lobbycode"]').should('not.exist')
		const hostButton = cy.get('[data-testid="go-to-host"]')
		hostButton.click()
		cy.get('[data-testid="welcome-message"]').should('not.exist')
		cy.get('[data-testid="lobbycode"]')
	})

	it('user can get to participant view', () => {
		const participateButton = cy.get('[data-testid="go-to-participate')
		participateButton.click()
		cy.get('[data-testid="welcome-message"]').should('not.exist')
		cy.get('[data-testid="lobby-form-header"]')
	})
})

describe('Host view', () => {
	beforeEach(() => {
		cy.visit('/host')
		//Wait until the lobby code is visible
	})

	it('should display an error when authenticating an invalid user', () => {
		cy.get('[data-testid="status-message-error"]').should('not.exist')
		cy.get('[data-testid="usercode-field"]').children().last().type('1234')
		cy.get('[data-testid="status-message-error"]')
	})

	it('should show a success message when a user is authenticated', async () => {
		cy.get('[data-testid="status-message_success"]').should('not.exist')

		// Is there a better way than nesting?
		// For some reason Cypress doesn't let you use variables outside of promises
		cy.get('[data-testid="lobbycode"]').then((value) => {
			const lobbyCode = value.text()

			cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {
				lobbyCode,
			}).then((response) => {
				const userCode = response.body.userCode

				cy.get('[data-testid="usercode-field"]').children().last().type(userCode)
				cy.get('[data-testid="status-message-success"]').should('exist')
			})
		})
	})

	it('can actually authenticate user', () => {
		cy.get('[data-testid="lobbycode"]').then((value) => {
			const lobbyCode = value.text()

			cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {
				lobbyCode,
			}).then((response) => {
				expect(response.body.length).equal(0)
			})

			cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {
				lobbyCode,
			}).then((response) => {
				const userCode = response.body.userCode
				cy.get('[data-testid="usercode-field"]').children().last().type(userCode)

				cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {
					lobbyCode,
				}).then((response) => {
					expect(response.body.length).equal(1)
				})
			})
		})
	})

	it('retains info after page reload', () => {
		// Wait until lobby status check has been finished
		cy.get('[data-testid="create-election-submit"]').should('be.enabled')
		cy.get('[data-testid="lobbycode"]').then((value) => {
			const lobbyCode: string = value.text()

			cy.visit('/host')
			cy.get('[data-testid="lobbycode"]').then((reloadValue) => {
				const lobbyCode2: string = reloadValue.text()
				expect(lobbyCode).equal(lobbyCode2)
			})
		})
	})
})

describe('Joining a lobby', () => {
	beforeEach(() => {
		cy.visit('/participant')
	})
	it('displays an error message when typing an invalid code', () => {
		cy.get('[data-testid="lobbycode-field-error"]').should('not.exist')
		// You always have to start typing from the last input element, for some reason...
		cy.get('[data-testid="lobbycode-field"]').find('input').last().type('1234')
		cy.get('[data-testid="lobbycode-field-error"]').should('exist')
	})

	it('shows the user code when entering a valid lobby', () => {
		cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
			const lobbyCode: string = res.body.lobbyCode

			cy.get('[data-testid="lobbycode-field"]').find('input').last().type(lobbyCode)
			cy.get('[data-testid="usercode"]')
		})
	})

	it('shows a message when authenticated', () => {
		cy.createLobbyAndUser(false)
		cy.get('[data-testid="lobby-header"]').should('not.exist')
		cy.get('@lobbyCode').then((lobbyCode) => {
			//This looks bad, but the type conversion is added to avoid TypeScript errors
			cy.get('[data-testid="lobbycode-field"]').find('input').last().type(lobbyCode as unknown as string)

			cy.get('[data-testid="lobby-header"]').should('not.exist')
			cy.get('[data-testid="usercode"]').then((value) => {
				const userCode: string = value.text()

				cy.authenticateUser(userCode)
				cy.get('[data-testid="lobby-header"]')
			})
		})

		

	})

	it('is still authenticated after reload', () => {
		cy.createLobbyAndUser(false)

		cy.get('@lobbyCode').then((lobbyCode) => {
			cy.get('[data-testid="lobbycode-field"]').find('input').last().type(lobbyCode as unknown as string)

			cy.get('[data-testid="usercode"]').then((value) => {
				const userCode: string = value.text()

				cy.authenticateUser(userCode)
				cy.get('[data-testid="lobby-header"]')
				cy.visit('/participant')
				cy.get('[data-testid="lobby-header"]')
			})

		})
		
	})
})
