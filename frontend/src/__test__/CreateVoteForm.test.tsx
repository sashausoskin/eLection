import { render, screen, waitFor } from "@testing-library/react"
import CreateVoteForm from "../routes/host/CreateVoteForm"
import userEvent from "@testing-library/user-event"
import FTPTForm from "../routes/host/vote_forms/FTPTForm"

describe('When selecting voting type', () => {
    test('can switch between different voting types', async () => {
        render(<CreateVoteForm />)
        const ftptRadio = screen.getByTestId("ftpt_radio")
        userEvent.click(ftptRadio)

        expect(screen.getByTestId("ftpt_form")).not.toBeNull()
        expect(() => screen.getByTestId("ranked_form")).toThrow()

        const rankedRadio = screen.getByTestId("ranked_radio")
        userEvent.click(rankedRadio)


        expect(await screen.findByTestId("ranked_form")).not.toBeNull()


        expect(() => screen.getByTestId("ftpt_form")).toThrow()
    })
})

describe('When creating a FTPT election', () => {
    let mockFn = vi.fn()
    let titleField = null as unknown as HTMLElement
    let candidateFields = null as unknown as HTMLElement[]
    let addCandidateButton = null as unknown as HTMLElement
    let submitButton = null as unknown as HTMLElement

    beforeEach(async () => {
        mockFn.mockClear()
        render(<FTPTForm onSubmitForm={mockFn} />)
        
        titleField = screen.getByTestId("title-field")
        
        candidateFields = screen.getAllByTestId("candidate-field")

        submitButton = screen.getByTestId("create-election-submit")

        addCandidateButton = screen.getByTestId("add-candidate-button")
    })


    test('cannot submit without entering title', async () => {
        expect(() => screen.getByTestId("title-error")).toThrow()

        await userEvent.type(candidateFields[0], "Test")
        await userEvent.type(candidateFields[1], "Test")
        await userEvent.click(submitButton)

        expect(mockFn.mock.calls.length).toBe(0)
        const titleError = screen.getByTestId("title-error")
        expect(titleError).toBeDefined()
    })

    test('cannot submit without entering two candidates', async () => {
        expect(() => screen.getByTestId("candidate-error")).toThrow()

        await userEvent.type(titleField, "Test")
        await userEvent.type(candidateFields[0], "Test")
        await userEvent.click(submitButton)

        expect(mockFn.mock.calls.length).toBe(0)
        const candidateError = screen.getByTestId("candidate-error")
        expect(candidateError).toBeDefined()
    })

    test('can add and remove candidates', async () => {
        expect((await screen.findAllByTestId("candidate-field")).length).toBe(2)

        await userEvent.click(addCandidateButton)
        expect(screen.getAllByTestId("candidate-field").length).toBe(3)
        const removeCandidateButton = screen.getAllByTestId("remove-candidate-button")
        await userEvent.click(removeCandidateButton[0])
        expect(screen.getAllByTestId("candidate-field").length).toBe(2)

    })

    test('can submit form', async () => {
        expect(mockFn.mock.calls.length).toBe(0)
        await userEvent.type(titleField, "title")

        expect(screen.getAllByTestId("candidate-field").length).toBe(2)

        const candidateFields = await screen.findAllByTestId('candidate-field')
        screen.debug()
        await userEvent.type(candidateFields[0], "candidate1")
        await userEvent.type(candidateFields[1], "candidate2")

        userEvent.click(submitButton)

        await waitFor(() => {
            expect(mockFn).toHaveBeenCalled()
            screen.debug()
        })
        expect(mockFn).toHaveBeenLastCalledWith({title: "title", candidates: ["candidate1", "candidate2"]})

    })
})
