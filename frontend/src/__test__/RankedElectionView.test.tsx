import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ElectionInfo } from "../types"
import RankedElectionView from "../routes/participant/voting_views/RankedElectionView"
import userEvent from "@testing-library/user-event"

// Didn't manage to get this working, so dragging and dropping should be tested in Cypress.
describe.skip('In ranked election view', () => {
    const jestFn = vi.fn()
    const exampleElectionInfo : ElectionInfo = {type: 'ranked', title: 'Test 2024', candidates: ['Candidate 1', 'Candidate 2', 'Candidate 3'], candidatesToRank: 2}

    beforeEach(() => {
        jestFn.mockReset()
        render(<RankedElectionView onSubmitVote={jestFn} electionInfo={exampleElectionInfo} />)
    })

    test('can order candidates', async () => {
        const sourceCandidate = screen.getAllByTestId('candidate-drag')[0]
        const targetCandidate = screen.getAllByTestId('candidate-drag')[1]

        await userEvent.click(screen.getByTestId('cast-vote'))
        expect(jestFn).toHaveBeenCalledWith(['Candidate 1', 'Candidate 2'])

        await waitFor(() => {fireEvent.dragStart(sourceCandidate)
            fireEvent.dragEnter(targetCandidate)
            fireEvent.dragOver(targetCandidate)
            fireEvent.drop(targetCandidate)
        })

        await waitFor(async () => {
            await userEvent.click(screen.getByTestId('cast-vote'))
            expect(jestFn).toHaveBeenCalledWith(['Candidate 2', 'Candidate 1'])
        })
        screen.debug()
    })
})