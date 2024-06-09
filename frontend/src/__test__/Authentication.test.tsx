import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Authentication } from '../routes/host/Authentication'
import { Mock, vi } from 'vitest'

describe('In authentication view', () => {
    let submitCallback : Mock | null = null
    let userCodeField : HTMLElement | null = null
    let userCodeSubmit : HTMLElement | null = null

    beforeEach(() => {
        submitCallback = vi.fn<string[]>()
        render(<Authentication lobbyCode={"1234"} onSubmitUserCode={submitCallback} />)

        userCodeField = screen.getByTestId('userCodeField')
        userCodeSubmit = screen.getByText("Submit")
    })

    afterEach(async () => {
        await userEvent.clear(userCodeField as HTMLElement)
    })

    test('Cannot submit with invalid code', async () => {
        

        expect(() => screen.getAllByTestId("userCodeFieldError")).toThrow()

        
        await userEvent.type(userCodeField as HTMLElement, "123")
        await userEvent.click(userCodeSubmit as HTMLElement)

        await waitFor(() => {
            expect(screen.getByTestId("userCodeFieldError")).toBeDefined()
            expect((submitCallback as Mock).mock.calls).toHaveLength(0)
        })

        
    })

    test('can submit with valid user code', async () => {
        expect((submitCallback as Mock).mock.calls).toHaveLength(0)

        await userEvent.type(userCodeField as HTMLElement, "1234")
        await userEvent.click(userCodeSubmit as HTMLElement)

        await waitFor(() => {
            expect(() => screen.getByTestId("userCodeFieldError")).toThrow()
            expect((submitCallback as Mock).mock.calls).toHaveLength(1)
        })
    })
})