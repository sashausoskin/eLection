/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import '@4tw/cypress-drag-drop'
import 'cypress-real-events'

Cypress.Commands.add('resetServer', () => {
	cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/reset`)
})

Cypress.Commands.add('createLobbyAndUser', (saveToStorage = true) => {
	cy.request('post', `${Cypress.env('BACKEND_URL')}/testing/createLobbyWithUser`).then((res) => {
		const lobbyCode = res.body.lobbyCode
		const participantToken = res.body.participantToken
		const hostToken = res.body.hostToken

		console.log(saveToStorage)

		if (saveToStorage) {
			cy.log('Storing info...')
			localStorage.setItem('hostLobbyCode', lobbyCode)
			localStorage.setItem('hostToken', `Bearer ${hostToken}`)
			localStorage.setItem('participantToken', `Bearer ${participantToken}`)
		}

		cy.wrap(lobbyCode).as('lobbyCode')
		cy.wrap(`Bearer ${hostToken}`).as('hostToken')
		cy.wrap(`Bearer ${participantToken}`).as('participantToken')
	})
})

Cypress.Commands.add('createElection', (electionInfo) => {
	cy.get('@lobbyCode').then((lobbyCode) => {
		cy.get('@hostToken').then((hostToken) => {
			cy.request({
				method: 'post', 
				url: `${Cypress.env('BACKEND_URL')}/host/createElection`,
				headers: {Authorization: hostToken},
				body: {lobbyCode,
					electionInfo
				}
			})
		})
	})
})

Cypress.Commands.add('castVote', (voteContent) => {
	cy.get('@participantToken').then((participantToken) => {
		cy.request({
			method: 'post',
			url: `${Cypress.env('BACKEND_URL')}/participant/castVote`,
			headers: {Authorization: participantToken},
			body: {voteContent}
		})
	})

})

Cypress.Commands.add('createUser', () => {
	cy.get('@lobbyCode').then((lobbyCode) => {
		cy.request('post', `${Cypress.env('BACKEND_URL')}/lobby/joinLobby`, {lobbyCode}).then((res) => {
			const userCode = res.body.userCode

			cy.get('@hostToken').then((hostToken) => {
				return cy.request({
					method: 'post',
					url: `${Cypress.env('BACKEND_URL')}/host/authenticateUser`,
					body: {lobbyCode, userCode},
					headers: {
						'Authorization': hostToken
					}
				})
			})
		})
	})
})

Cypress.Commands.add('closeLobby', function () {
	return cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/host/closeLobby`,
		body: {lobbyCode: this.lobbyCode},
		headers: {
			'Authorization': this.hostToken
		}
	})
})

Cypress.Commands.add('startCleanup', function () {
	return cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/testing/forceServerCleanup`,
	})
})

Cypress.Commands.add('endElection', function () {
	cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/host/endElection`,
		body: {lobbyCode: this.lobbyCode},
		headers: {
			'Authorization': this.hostToken
		}
	})
})

Cypress.Commands.add('getElectionResults', function () {
	return cy.request(`${Cypress.env('BACKEND_URL')}/testing/getElectionResults`, {lobbyCode: this.lobbyCode})
})

Cypress.Commands.add('setLobbyLastActive', function (lastActiveTime : number) {
	return cy.request('post',`${Cypress.env('BACKEND_URL')}/testing/setLobbyLastActive`, {lobbyCode: this.lobbyCode, lastActiveTime})
})

Cypress.Commands.add('getNumberOfLobbies', function () {
	return cy.request('get', `${Cypress.env('BACKEND_URL')}/testing/getNumberOfLobbies`)
})

Cypress.Commands.add('authenticateUser', function (userCode) {
	return cy.request({
		method: 'post',
		url: `${Cypress.env('BACKEND_URL')}/host/authenticateUser`,
		body: {userCode},
		headers: {
			'Authorization': this.hostToken
		}
	})
})

Cypress.Commands.add('goOffline', function () {
	cy.log('**go offline**')
		.then(() => {
			return Cypress.automation('remote:debugger:protocol',
				{
					command: 'Network.enable',
				})
		})
		.then(() => {
			return Cypress.automation('remote:debugger:protocol',
				{
					command: 'Network.emulateNetworkConditions',
					params: {
						offline: true,
						latency: -1,
						downloadThroughput: -1,
						uploadThroughput: -1,
					},
				})
		})
})

Cypress.Commands.add('goOnline', function () {
	cy.log('**go online**')
		.then(() => {
			return Cypress.automation('remote:debugger:protocol',
				{
					command: 'Network.emulateNetworkConditions',
					params: {
						offline: false,
						latency: -1,
						downloadThroughput: -1,
						uploadThroughput: -1,
					},
				})
		})
		.then(() => {
			return Cypress.automation('remote:debugger:protocol',
				{
					command: 'Network.disable',
				})
		})
})