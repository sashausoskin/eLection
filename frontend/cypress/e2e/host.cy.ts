describe("In host view", () => {
    beforeEach(() => {
        cy.resetServer()
        cy.createLobbyAndUser()
        cy.visit('/host')
    })
    it("Can create a FPTP election", () => {
        cy.get("[data-testid='fptp_radio']").click()
        cy.get("[data-testid='title-field']").type("Language?")
        cy.get("[data-testid='candidate-field']").eq(0).type("Python")
        cy.get("[data-testid='candidate-field']").eq(1).type("JavaScript")

        cy.get("[data-testid='create-election-submit']").click()

        cy.get("[data-testid='status-success']")
    })
})