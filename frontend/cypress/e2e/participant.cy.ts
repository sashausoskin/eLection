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

    describe("with an active election going on", () => {
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
})