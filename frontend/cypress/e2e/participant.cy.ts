import { ElectionInfo } from '../../src/types'
import {Globals} from '@react-spring/web'

describe('In participant view', () => {
	before(() => {
		Globals.assign({
			skipAnimation: true
		})
	})

	beforeEach(() => {
		cy.resetServer()
		cy.createLobbyAndUser()
		cy.visit('/participant')
	})

	it('can see when a new election starts', () => {
		const exampleElection = {type: 'FPTP', title: 'President 2024', candidates: ['Joe Biden', 'Donald Trump']} as ElectionInfo

		cy.createElection(exampleElection)

		cy.contains(exampleElection.title)
		exampleElection.candidates.forEach((candidate) => {
			cy.contains(candidate)
		})
	})

	it('can see when an election ends', () => {
		const exampleElection = {type: 'FPTP', title: 'President 2024', candidates: ['Joe Biden', 'Donald Trump']} as ElectionInfo

		cy.createElection(exampleElection)

		cy.contains(exampleElection.title)
		
		cy.endElection()

		cy.get('[data-testid=\'election-end-header\']')
	})

	// At least for now, Socket.IO doesn't work well with the Chrome Devtools network emulation
	it.skip('attempts to reconnect after losing connection', () => {
		cy.visit('/participant')
		cy.get('[data-testid="lobby-standby-header"]')

		cy.goOffline()
		cy.get('[data-testid=\'lobby-standby-header\']').should('not.exist')
		cy.contains('[data-testid=\'lobby-reconnect\']')

		cy.goOnline()
		cy.contains('[data-testid=\'lobby-standby-header\']')
		cy.get('[data-testid=\'lobby-reconnect\']').should('not.exist')
	})

	describe('with an active FPTP election going on', () => {
		beforeEach(() => {
			cy.createElection({type: 'FPTP', title: 'Representative 2024', candidates: ['Bob the Builder', 'Thomas the Tank Engine']})
		})

		it('can see when a vote has been submitted', () => {
			cy.get('[data-testid=\'candidate-radio\']').eq(0).click()
			cy.get('[data-testid=\'vote-submit\'').click()

			cy.get('[data-testid=\'vote-submitted-header\']')
		})

		it('cannot vote again after submitting vote', () => {
			cy.get('[data-testid=\'candidate-radio\']').eq(0).click()
			cy.get('[data-testid=\'vote-submit\'').click()

			cy.get('[data-testid=\'vote-submitted-header\']')

			cy.visit('/participant')

			cy.get('[data-testid=\'candidate-radio\']').should('not.exist')
		})
	})

	describe('with an active ranked election going on', () => {
		const electionInfo : ElectionInfo = {type: 'ranked', title: 'Best testing framework?', candidates: ['Cypress', 'Playwright', 'Jest'], candidatesToRank: 2} 
		beforeEach(() => {
			cy.createElection(electionInfo)
		})
		it('can submit vote', () => {
			cy.get('[data-testid=\'cast-vote\']').click()
			cy.get('[data-testid=\'vote-submitted-header\']').should('exist')

			cy.getElectionResults().then((res) => {
				expect(res.body[electionInfo.candidates[0]]).equal(2)
				expect(res.body[electionInfo.candidates[1]]).equal(1)
				expect(res.body[electionInfo.candidates[2]]).equal(0)
			})
		})
		it.skip('can reorder candidates', () => {
			// Moving the candidates is very inconsistent, and it's up to chance when this test passes. For now, skip this test.
			cy.get('[data-testid=\'candidate-drag-0\']').first().realMouseDown({position: 'center'})
				.realMouseMove(0, 150, {position: 'center'})
			// This isn't good, but the animations make the tests very unpredictable, so we have to wait a bit until the animations finish
				.wait(100)
				.realMouseUp()
			cy.get('[data-testid=\'cast-vote\']').click()
			cy.getElectionResults().then((res) => {
				expect(res.body[electionInfo.candidates[0]]).equal(1)
				expect(res.body[electionInfo.candidates[1]]).equal(2)
				expect(res.body[electionInfo.candidates[2]]).equal(0)
			})
		})
		it('can cast empty vote', () => {
			cy.get('[data-testid=\'cast-empty-vote\']').click()
			cy.get('[data-testid=\'confirm-button\']').click()
			cy.get('[data-testid=\'vote-submitted-header\']').should('exist')

			cy.getElectionResults().then((res) => {
				expect(res.body[electionInfo.candidates[0]]).equal(0)
				expect(res.body[electionInfo.candidates[1]]).equal(0)
				expect(res.body[electionInfo.candidates[2]]).equal(0)
			})
		})
	})

	it('can see when the host closes the lobby', () => {
		//This is to make sure that the test doesn't close the lobby before the user has connected
		cy.get('[data-testid=\'lobby-standby-header\']')
		cy.closeLobby()
		cy.get('[data-testid=\'lobby-close-header\']')
	})

	it('can see when the lobby is closed due to inactivity', () => {
		cy.get('[data-testid=\'lobby-standby-header\']')
		cy.setLobbyLastActive(Date.now() - 1000*60*60*3)
		cy.startCleanup()
		cy.get('[data-testid=\'lobby-close-header\']')
	})
})