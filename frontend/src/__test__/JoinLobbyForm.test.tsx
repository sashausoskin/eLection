import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mock, vi } from 'vitest'
import { JoinLobbyForm } from '../routes/participant/JoinLobbyForm'

describe('In join lobby view', () => {
    let submitCallback : Function | null = null
    let lobbyCodeField : HTMLElement | null = null
    let lobbyCodeSubmit : HTMLElement | null = null

    beforeEach(() => {
        submitCallback = vi.fn<string[]>() as Function
        render(<JoinLobbyForm handleSubmitLobbyCode={(lobbyCode) => (submitCallback as Function)(lobbyCode)} />)

        lobbyCodeField = screen.getByTestId('lobbyCodeField')
        lobbyCodeSubmit = screen.getByText("Submit")
    })

    afterEach(() => {
        userEvent.clear(lobbyCodeField as HTMLElement)
    })

    test.only('Cannot submit with invalid code', async () => {
        expect(() => screen.getAllByTestId("lobbyCodeFieldError")).toThrow()
        await userEvent.type(lobbyCodeField as HTMLElement, "123")
        await userEvent.click(lobbyCodeSubmit as HTMLElement)

        waitFor(() => {
            expect(screen.getByTestId("lobbyCodeFieldError")).toBeDefined()
            expect((submitCallback as Mock).mock.calls).toHaveLength(0)
        })

        
    })

    test('can submit with valid user code', async () => {
        expect((submitCallback as Mock).mock.calls).toHaveLength(0)

        await userEvent.type(lobbyCodeField as HTMLElement, "1234")
        await userEvent.click(lobbyCodeSubmit as HTMLElement)
        
        
        await waitFor(() => {
            expect(() => screen.getByTestId("lobbyCodeFieldError")).toThrow()
            expect((submitCallback as Mock).mock.calls).toHaveLength(1)
            expect((submitCallback as Mock).mock.lastCall).toHaveLength(1)
        })
    })
})