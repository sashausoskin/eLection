import { defineConfig } from 'cypress'

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:4173',
		port: 4174,
		expose: {
			backendUrl: "http://localhost:3000"
		}
	},
})
