import { expect } from 'chai';

beforeEach(() => {
	cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/reset`);
});

describe('Main menu', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('user can get to the main menu', () => {
		cy.get('[data-testid="welcome-message"]');
	});

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
		cy.get('[data-testid="lobbycode"]').should('not.exist');
		const hostButton = cy.get('[data-testid="go-to-host"]');
		hostButton.click();
		cy.get('[data-testid="welcome-message"]').should('not.exist');
		cy.get('[data-testid="lobbycode"]');
	});

	it('user can get to participant view', () => {
		const participateButton = cy.get('[data-testid="go-to-participate');
		participateButton.click();
		cy.get('[data-testid="welcome-message"]').should('not.exist');
		cy.get('[data-testid="lobby-form-header"]');
	});
});

describe('Host view', () => {
	beforeEach(() => {
		cy.visit('/host');
		//Wait until the lobby code is visible
	});

	it('should display an error when authenticating an invalid user', () => {
		cy.get('[data-testid="status-message-error"]').should('not.exist');
		cy.get('[data-testid="usercode-field"]').type('1234');
		cy.get('[data-testid="submit-authentication"]').click();
		cy.get('[data-testid="status-message-error"]');
	});

	it('should show a success message when a user is authenticated', async () => {
		cy.get('[data-testid="status-message_success"]').should('not.exist');

		// Is there a better way than nesting?
		// For some reason Cypress doesn't let you use variables outside of promises
		cy.get('[data-testid="lobbycode"]').then((value) => {
			const lobbyCode = value.text();

			cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {
				lobbyCode,
			}).then((response) => {
				const userCode = response.body.userCode;

				cy.get('[data-testid="usercode-field"]').type(userCode);
				cy.get('[data-testid="submit-authentication"]').click();
				cy.get('[data-testid="status-message-success"]').should('exist');
			});
		});
	});

	it('can actually authenticate user', () => {
		cy.get('[data-testid="lobbycode"]').then((value) => {
			const lobbyCode = value.text();

			cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {
				lobbyCode,
			}).then((response) => {
				expect(response.body.length).equal(0);
			});

			cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {
				lobbyCode,
			}).then((response) => {
				const userCode = response.body.userCode;
				cy.get('[data-testid="usercode-field"]').type(userCode);
				cy.get('[data-testid="submit-authentication"]').click();

				cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {
					lobbyCode,
				}).then((response) => {
					expect(response.body.length).equal(1);
				});
			});
		});
	});

	it('retains info after page reload', () => {
		cy.get('[data-testid="lobbycode"]').then((value) => {
			const lobbyCode: string = value.text();

			cy.visit('/host');
			cy.get('[data-testid="lobbycode"]').then((reloadValue) => {
				const lobbyCode2: string = reloadValue.text();
				expect(lobbyCode).equal(lobbyCode2);
			});
		});
	});
});

describe('Joining a lobby', () => {
	beforeEach(() => {
		cy.visit('/participant');
	});
	it('displays an error message when typing an invalid code', () => {
		cy.get('[data-testid="lobbycode-field-error"]').should('not.exist');
		cy.get('[data-testid="lobbycode-field"]').type('1234');
		cy.get('button').click();
		cy.get('[data-testid="lobbycode-field-error"]').should('exist');
	});

	it('shows the user code when entering a valid lobby', () => {
		cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
			const lobbyCode: string = res.body.lobbyCode;

			cy.get('[data-testid="lobbycode-field"]').type(lobbyCode);
			cy.get('button').click();
			cy.get('[data-testid="usercode"]');
		});
	});

	it('shows a message when authenticated', () => {
		cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
			cy.get('[data-testid="lobby-header"]').should('not.exist');
			const lobbyCode: string = res.body.lobbyCode;
			const hostID: string = res.body.hostID;

			cy.get('[data-testid="lobbycode-field"]').type(lobbyCode);
			cy.get('button').click();

			cy.get('[data-testid="lobby-header"]').should('not.exist');
			cy.get('[data-testid="usercode"]').then((value) => {
				const userCode: string = value.text();

				cy.request({
					method: 'POST',
					url: `${Cypress.env('BACKEND_URL')}/host/authenticateUser`,
					body: { userCode, lobbyCode },
					headers: {
						Authorization: hostID,
					},
				});
				cy.get('[data-testid="lobby-header"]');
			});
		});
	});

	it('is still authenticated after reload', () => {
		cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
			const lobbyCode: string = res.body.lobbyCode;
			const hostID: string = res.body.hostID;

			cy.get('[data-testid="lobbycode-field"]').type(lobbyCode);
			cy.get('button').click();

			cy.get('[data-testid="usercode"]').then((value) => {
				const userCode: string = value.text();

				cy.request({
					method: 'POST',
					url: `${Cypress.env('BACKEND_URL')}/host/authenticateUser`,
					body: { userCode, lobbyCode },
					headers: {
						Authorization: hostID,
					},
				});
				cy.get('[data-testid="lobby-header"]');
				cy.visit('/participant');
				cy.get('[data-testid="lobby-header"]');
			});
		});
	});
});
