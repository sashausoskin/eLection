import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateElectionForm from '../routes/host/CreateElectionForm'

vi.mock('react-router', () => ({
	useNavigate: () => vi.fn()
}))

describe('When creating a FTPT election', () => {
    const mockFn = vi.fn()
    let titleField = null as unknown as HTMLElement
    let candidateFields = null as unknown as HTMLElement[]
    let addCandidateButton = null as unknown as HTMLElement
    let submitButton = null as unknown as HTMLElement

    beforeEach(async () => {
        mockFn.mockClear()
        render(<CreateElectionForm onSubmitForm={mockFn} skipStatusCheck/>)
        
        titleField = screen.getByTestId('title-field')
        
        candidateFields = screen.getAllByTestId('candidate-field')

        submitButton = screen.getByTestId('create-election-submit')

        addCandidateButton = screen.getByTestId('add-candidate-button')
    })


    test('cannot submit without entering title', async () => {
        expect(() => screen.getByTestId('title-error')).toThrow()

        await userEvent.type(candidateFields[0], 'Test')
        await userEvent.type(candidateFields[1], 'Test')
        await userEvent.click(submitButton)

        expect(mockFn.mock.calls.length).toBe(0)
        const titleError = screen.getByTestId('title-error')
        expect(titleError).toBeDefined()
    })

    test('cannot submit without entering two candidates', async () => {
        expect(() => screen.getByTestId('candidate-error')).toThrow()

        await userEvent.type(titleField, 'Test')
        await userEvent.type(candidateFields[0], 'Test')
        await userEvent.click(submitButton)

        expect(mockFn.mock.calls.length).toBe(0)
        const candidateError = screen.getByTestId('candidate-error')
        expect(candidateError).toBeDefined()
    })

    test('can add and remove candidates', async () => {
        expect((await screen.findAllByTestId('candidate-field')).length).toBe(2)

        await userEvent.click(addCandidateButton)
        expect(screen.getAllByTestId('candidate-field').length).toBe(3)
        const removeCandidateButton = screen.getAllByTestId('remove-candidate-button')
        await userEvent.click(removeCandidateButton[0])
        expect(screen.getAllByTestId('candidate-field').length).toBe(2)

    })

    test('can submit form', async () => {
        expect(mockFn.mock.calls.length).toBe(0)
        await userEvent.type(titleField, 'title')

        expect(screen.getAllByTestId('candidate-field').length).toBe(2)

        const candidateFields = await screen.findAllByTestId('candidate-field')
        await userEvent.type(candidateFields[0], 'candidate1')
        await userEvent.type(candidateFields[1], 'candidate2')

        userEvent.click(submitButton)

        await waitFor(() => {
            expect(mockFn).toHaveBeenCalled()
        })
        expect(mockFn).toHaveBeenLastCalledWith({type: 'FPTP', title: 'title', candidates: ['candidate1', 'candidate2']})

    })
})
