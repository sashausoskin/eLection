import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Authentication } from '../routes/host/Authentication'
import { Mock, vi } from 'vitest'


vi.mock('react-router', () => ({
	// eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
	useNavigate: () => vi.fn()
}))

describe('In authentication view', () => {
	let submitCallback: Mock
	let userCodeField: HTMLElement
	let userCodeSubmit: HTMLElement

	beforeEach(() => {
		submitCallback = vi.fn()
		render(<Authentication lobbyCode={'1234'} onSubmitUserCode={submitCallback} />)

		userCodeField = screen.getByTestId('usercode-field')
		userCodeSubmit = screen.getByTestId('submit-authentication')
	})

	afterEach(async () => {
		await userEvent.clear(userCodeField as HTMLElement)
	})

	test('Cannot submit with invalid code', async () => {
		expect(() => screen.getAllByTestId('usercode-field-error')).toThrow()

		await userEvent.type(userCodeField as HTMLElement, '123')
		await userEvent.click(userCodeSubmit as HTMLElement)

		await waitFor(() => {
			expect(screen.getByTestId('usercode-field-error')).toBeDefined()
			expect((submitCallback as Mock).mock.calls).toHaveLength(0)
		})
	})

	test('can submit with valid user code', async () => {
		expect((submitCallback as Mock).mock.calls).toHaveLength(0)

		await userEvent.type(userCodeField as HTMLElement, '1234')
		await userEvent.click(userCodeSubmit as HTMLElement)

		await waitFor(() => {
			expect(() => screen.getByTestId('usercode-field-error')).toThrow()
			expect((submitCallback as Mock).mock.calls).toHaveLength(1)
		})
	})
})
