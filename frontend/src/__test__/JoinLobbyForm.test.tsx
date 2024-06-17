import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mock, vi } from 'vitest'
import { JoinLobbyForm } from '../routes/participant/JoinLobbyForm'

describe('In join lobby view', () => {
	const submitCallback: Mock<string[]> = vi.fn<string[]>()
	let lobbyCodeField: HTMLElement = null as unknown as HTMLElement
	let lobbyCodeSubmit: HTMLElement = null as unknown as HTMLElement

	beforeEach(() => {
		submitCallback.mockReset()
		render(<JoinLobbyForm handleSubmitLobbyCode={submitCallback} />)

		lobbyCodeField = screen.getByTestId('lobbycode-field')
		lobbyCodeSubmit = screen.getByText('Submit')
	})

	afterEach(() => {
		userEvent.clear(lobbyCodeField as HTMLElement)
	})

	test('Cannot submit with invalid code', async () => {
		expect(() => screen.getAllByTestId('lobbycode-field-error')).toThrow()
		await userEvent.type(lobbyCodeField, '123')
		await userEvent.click(lobbyCodeSubmit)

		waitFor(() => {
			expect(screen.getByTestId('lobbycode-field-error')).toBeDefined()
			expect(submitCallback.mock.calls).toHaveLength(0)
		})
	})

	test('can submit with valid user code', async () => {
		expect(submitCallback.mock.calls).toHaveLength(0)

		await userEvent.type(lobbyCodeField, '1234')
		await userEvent.click(lobbyCodeSubmit)

		await waitFor(() => {
			expect(() => screen.getByTestId('lobbycode-field-error')).toThrow()
			expect(submitCallback.mock.calls).toHaveLength(1)
			expect(submitCallback.mock.lastCall).toHaveLength(1)
		})
	})
})
