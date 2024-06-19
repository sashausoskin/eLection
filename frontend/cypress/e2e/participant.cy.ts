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
})