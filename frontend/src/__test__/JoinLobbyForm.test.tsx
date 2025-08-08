import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { JoinLobbyForm } from '../routes/participant/JoinLobbyForm'

describe('In join lobby view', () => {
	const submitCallback= vi.fn()
	let lobbyCodeField: HTMLElement

	beforeEach(() => {
		submitCallback.mockReset()
		render(<JoinLobbyForm handleSubmitLobbyCode={submitCallback} />)

		lobbyCodeField = screen.getByTestId('lobbycode-field') as HTMLDivElement
	})

	afterEach(() => {
		for (const child of lobbyCodeField.children) {
			userEvent.clear(child)
		}
	})

	test('Cannot submit with invalid code', async () => {
		expect(() => screen.getAllByTestId('lobbycode-field-error')).toThrow()
		await userEvent.type(lobbyCodeField, '123')

		waitFor(() => {
			expect(submitCallback.mock.calls).toHaveLength(0)
		})
	})

	test('can submit with valid user code', async () => {
		expect(submitCallback.mock.calls).toHaveLength(0)

		await userEvent.type(lobbyCodeField, '1234')

		await waitFor(() => {
			expect(submitCallback.mock.calls).toHaveLength(1)
			expect(submitCallback.mock.lastCall).toHaveLength(1)
		})
	})
})
