import { expect } from "chai"

beforeEach(() => {
  cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/reset`)
})

describe('Main menu', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('user can get to the main menu', () => {
    cy.get('[data-testid="welcomeMessage"]')
  })

  it('user can get to host view', () => {
    cy.get('[data-testid="lobbyCode"]').should('not.exist')
    const hostButton = cy.get('[data-testid="goToHost"]')
    hostButton.click()
    cy.get('[data-testid="welcomeMessage"]').should('not.exist')
    cy.get('[data-testid="lobbyCode"]')
  })

  it('user can get to participant view', () => {
    const participateButton = cy.get('[data-testid="goToParticipate')
    participateButton.click()
    cy.get('[data-testid="welcomeMessage"]').should('not.exist')
    cy.get('[data-testid="lobbyFormHeader"]')
  })
})

describe('Host view', () => {
  beforeEach(() => {
    cy.visit('/host')
    //Wait until the lobby code is visible
  })

  it('should display an error when authenticating an invalid user', () => {
    cy.get('[data-testid="statusMessage_error"]').should('not.exist')
    cy.get('[data-testid="userCodeField"]').type("1234")
    cy.get('button').click()
    cy.get('[data-testid="statusMessage_error"]')
  })

  it('should show a success message when a user is authenticated', async () => {
    cy.get('[data-testid="statusMessage_success"]').should('not.exist')

    // Is there a better way than nesting?
    // For some reason Cypress doesn't let you use variables outside of promises
    cy.get('[data-testid="lobbyCode"]').then((value) => {
      const lobbyCode = value.text()

      cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {lobbyCode}).then((response) => {
        const userCode = response.body.userCode

        cy.get('[data-testid="userCodeField"]').type(userCode)
        cy.get('button').click()
        cy.get('[data-testid="statusMessage_success"]').should('exist')
      })
    })
  })

  it('can actually authenticate user', () => {
    cy.get('[data-testid="lobbyCode"]').then((value) => {
      const lobbyCode = value.text()

      cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {lobbyCode}).then((response) => {
        expect(response.body.length).equal(0)
      })

      cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {lobbyCode}).then((response) => {
        const userCode = response.body.userCode
        cy.get('[data-testid="userCodeField"]').type(userCode)
        cy.get('button').click()

        cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {lobbyCode}).then((response) => {
          expect(response.body.length).equal(1)
        })
      })
    })
  })

  it('retains info after page reload', () => {
    cy.get('[data-testid="lobbyCode"]').then((value) => {
      const lobbyCode : string = value.text()

      cy.visit('/host')
      cy.get('[data-testid="lobbyCode"]').then((reloadValue) => {
        const lobbyCode2 : string = reloadValue.text()
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
    cy.get('[data-testid="lobbyCodeFieldError"]').should('not.exist')
    cy.get('[data-testid="lobbyCodeField"]').type('1234')
    cy.get('button').click()
    cy.get('[data-testid="lobbyCodeFieldError"]').should('exist')
  })

  it('shows the user code when entering a valid lobby', () => {
    cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
      const lobbyCode : string = res.body.lobbyCode

      cy.get('[data-testid="lobbyCodeField"]').type(lobbyCode)
      cy.get('button').click()
      cy.get('[data-testid="userCode"]')
    })
  })

  it('shows a message when authenticated', () => {
    cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
      cy.get('[data-testid="lobbyHeader"]').should('not.exist')
      const lobbyCode : string = res.body.lobbyCode
      const hostID : string = res.body.hostID

      cy.get('[data-testid="lobbyCodeField"]').type(lobbyCode)
      cy.get('button').click()

      cy.get('[data-testid="lobbyHeader"]').should('not.exist')
      cy.get('[data-testid="userCode"]').then((value) => {
        const userCode : string = value.text()

        cy.request({
          method: "POST",
          url: `${Cypress.env('BACKEND_URL')}/lobby/authenticateUser`,
          body: {userCode, lobbyCode},
          headers: {
            Authorization: hostID
          }
        })
        cy.get('[data-testid="lobbyHeader"]')
      })
    })
  })

  it('is still authenticated after reload', () => {
    cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/createLobby`).then((res) => {
      const lobbyCode : string = res.body.lobbyCode
      const hostID : string = res.body.hostID

      cy.get('[data-testid="lobbyCodeField"]').type(lobbyCode)
      cy.get('button').click()

      cy.get('[data-testid="userCode"]').then((value) => {
        const userCode : string = value.text()

        cy.request({
          method: "POST",
          url: `${Cypress.env('BACKEND_URL')}/lobby/authenticateUser`,
          body: {userCode, lobbyCode},
          headers: {
            Authorization: hostID
          }
        })
        cy.get('[data-testid="lobbyHeader"]')
        cy.visit('/participant')
        cy.get('[data-testid="lobbyHeader"]')
      })
    })
  })
})