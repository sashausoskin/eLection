import { ElectionInfo } from "../../src/types"

describe("In participant view", () => {
    beforeEach(() => {
        cy.resetServer()
        cy.createLobbyAndUser()
        cy.visit('/participant')
    })

    it("Can see when a new election starts", () => {
        const exampleElection = {type: "FPTP", title: "President 2024", candidates: ["Joe Biden", "Donald Trump"]} as ElectionInfo

        cy.createElection(exampleElection)

        cy.contains(exampleElection.title)
        exampleElection.candidates.forEach((candidate) => {
            cy.contains(candidate)
        })
    })

    describe("with an active FPTP election going on", () => {
        beforeEach(() => {
            cy.createElection({type: "FPTP", title: "Representative 2024", candidates: ["Bob the Builder", "Thomas the Tank Engine"]})
        })

        it("can see when a vote has been submitted", () => {
            cy.get("[data-testid='candidate-radio']").eq(0).click()
            cy.get("[data-testid='vote-submit'").click()

            cy.get("[data-testid='vote-submitted-header']")
        })

        it("cannot vote again after submitting vote", () => {
            cy.get("[data-testid='candidate-radio']").eq(0).click()
            cy.get("[data-testid='vote-submit'").click()

            cy.get("[data-testid='vote-submitted-header']")

            cy.visit("/participant")

            cy.get("[data-testid='candidate-radio']").should('not.exist')
        })
    })

    describe('with an active ranked election going on', () => {
        const electionInfo : ElectionInfo = {type: 'ranked', title: 'Best testing framework?', candidates: ['Cypress', 'Playwright', 'Jest'], candidatesToRank: 2} 
        beforeEach(() => {
            cy.createElection(electionInfo)
        })
        it('can submit vote', () => {
            cy.get("[data-testid='cast-vote']").click()
            cy.get("[data-testid='vote-submitted-header']").should('exist')

            cy.getElectionResults().then((res) => {
                expect(res.body[electionInfo.candidates[0]]).equal(2)
                expect(res.body[electionInfo.candidates[1]]).equal(1)
                expect(res.body[electionInfo.candidates[2]]).equal(0)
            })
        })
        it('can reorder candidates', () => {
            cy.get("[data-testid='candidate-drag-0']").realMouseDown({position: 'center'}).realMouseMove(0, 100, {position: 'center'}).realMouseUp()
            cy.get("[data-testid='cast-vote']").click()
            cy.getElectionResults().then((res) => {
                expect(res.body[electionInfo.candidates[0]]).equal(1)
                expect(res.body[electionInfo.candidates[1]]).equal(2)
                expect(res.body[electionInfo.candidates[2]]).equal(0)
            })
        })
        it('can cast empty vote', () => {
            cy.get("[data-testid='cast-empty-vote']").click()
            cy.get("[data-testid='vote-submitted-header']").should('exist')

            cy.getElectionResults().then((res) => {
                expect(res.body[electionInfo.candidates[0]]).equal(0)
                expect(res.body[electionInfo.candidates[1]]).equal(0)
                expect(res.body[electionInfo.candidates[2]]).equal(0)
            })
        })
    })
})