import { expect } from "chai"
import { config } from "dotenv"
import path = require("path")

beforeEach(() => {
  cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/reset`)
})

describe('Main menu', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
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
    cy.visit('http://localhost:5173/host')
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
    cy.get('[data-testid="lobbyCode"]').then(($value) => {
      const lobbyCode = $value.text()

      cy.request('get', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {lobbyCode}).then((response) => {
        const userCode = response.body.userCode

        cy.get('[data-testid="userCodeField"]').type(userCode)
        cy.get('button').click()
        cy.get('[data-testid="statusMessage_success"]').should('exist')
      })
    })
  })

  it('can actually authenticate user', () => {
    cy.get('[data-testid="lobbyCode"]').then(($value) => {
      const lobbyCode = $value.text()

      cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {lobbyCode}).then((response) => {
        expect(response.body.length).equal(0)
      })

      cy.request('get', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {lobbyCode}).then((response) => {
        const userCode = response.body.userCode
        cy.get('[data-testid="userCodeField"]').type(userCode)
        cy.get('button').click()

        cy.request(`${Cypress.env('BACKEND_URL')}/testing/getParticipants`, {lobbyCode}).then((response) => {
          expect(response.body.length).equal(1)
        })
      })
    })
  })
})