import { ElectionInfo } from "../../src/types"

describe ("In viewer", () => {
    beforeEach(() => {
        cy.resetServer()
        cy.createLobbyAndUser()
        cy.visit('/viewer')
    })

    it("can see lobby code when on standby", () => {
        cy.get('@lobbyCode').then((lobbyCode) => {
            cy.get("[data-testid='lobbyCode']").should('contain', lobbyCode)
        })
    })
    it("Can see election information when an election is created", () => {
        const exampleElectionInfo = {type: 'FPTP', title: "Title", candidates: ['Candidate 1' ,'Candidate 2']} as ElectionInfo
        
        cy.createElection(exampleElectionInfo)
        cy.contains(exampleElectionInfo.title)
        exampleElectionInfo.candidates.forEach((candidate) => {
            cy.contains(candidate)
        })

    })
})