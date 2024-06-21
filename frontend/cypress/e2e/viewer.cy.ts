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
    it("can see when a new user has joined the lobby", () => {
        cy.get("[data-testid='users-joined']").contains('1')
        

        cy.createUser()

        cy.get("[data-testid='users-joined']").contains('2')
    })

    describe("with an active election", () => {
        beforeEach(() => {
            const exampleElection : ElectionInfo = {type: "FPTP", title: "Best Spider-Man?", candidates: ['Toby Maguire', 'Andrew Garfield', 'Tom Holland']}
            cy.wrap(exampleElection).as('exampleElectionInfo')

            cy.createElection(exampleElection)
        })

        it('sees when someone casts a vote', function() {
            cy.get("[data-testid='votes-cast']").contains('0')

            cy.castVote((this.exampleElectionInfo as ElectionInfo).candidates[0])

            cy.get("[data-testid='votes-cast']").contains('1')
        })

        it('sees when someone joins the lobby', function() {
            cy.get("[data-testid='participant-amount']").contains('1')

            cy.createUser()

            cy.get("[data-testid='participant-amount']").contains('2')
        })
    })
})