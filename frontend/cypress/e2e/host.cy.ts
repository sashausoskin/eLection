describe("In host view", () => {
    beforeEach(() => {
        cy.resetServer()
        cy.createLobbyAndUser()
        cy.visit('/host')
    })
    it("Can create a FPTP election and end election", () => {
        cy.get("[data-testid='fptp-radio']").click()
        cy.get("[data-testid='title-field']").type("Language?")
        cy.get("[data-testid='candidate-field']").eq(0).type("Python")
        cy.get("[data-testid='candidate-field']").eq(1).type("JavaScript")

        cy.get("[data-testid='end-election-button']").should('be.disabled')

        cy.get("[data-testid='create-election-submit']").click()

        cy.get("[data-testid='status-success']")

        cy.get("[data-testid='end-election-button']").should('be.enabled')
        cy.get("[data-testid='create-election-submit']").should('be.disabled')

        cy.get("[data-testid='end-election-button']").click()

        cy.get("[data-testid='status-success']")

        cy.get("[data-testid='end-election-button']").should('be.disabled')
        cy.get("[data-testid='create-election-submit']").should('be.enabled')
    })

    it('can create a ranked election', () => {
        cy.get("[data-testid='ranked-radio']").click()
        cy.get("[data-testid='title-field']").type('Who should the next world president be?')
        cy.get("[data-testid='candidates-to-rank'").clear().type('2')
        cy.get("[data-testid='candidate-field']").eq(0).type('Nelson Mandela')
        cy.get("[data-testid='candidate-field']").eq(1).type('Mahatma Gandhi')

        cy.get("[data-testid='create-election-submit']").click()

        cy.get("[data-testid='status-success']")

    })

    it('can close lobby', () => {
        cy.getNumberOfLobbies().then((res) => {
            expect(res.body.numberOfLobbies).eq(1)
        })
        cy.get("[data-testid='close-lobby']").click()
        cy.get("[data-testid='confirm-button']").click()
        cy.get("[data-testid='confirm-button']").click()
        cy.get("[data-testid='welcome-message']")
        cy.getNumberOfLobbies().then((res) => {
            expect(res.body.numberOfLobbies).eq(0)
        })

    })

    describe('when the lobby is closed', () => {
        beforeEach(() => {
            cy.get('[data-testid="create-election-submit"]').should('be.enabled')
            // This isn't the best method, but wait until the election status has been fetched
            cy.closeLobby()
        })

        it('is kicked when trying to authenticate a user', () => {
            cy.get('[data-testid="usercode-field"]').type('1234');
			cy.get('[data-testid="submit-authentication"]').click();

            cy.get('[data-testid="popup-text"]')
            cy.get('[data-testid="confirm-button"]').click()
            cy.get('[data-testid="welcome-message"]')
        })
    })
})