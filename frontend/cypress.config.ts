import { config } from 'dotenv'
config()
import { defineConfig } from 'cypress'

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:4173',
		port: 4174,
		setupNodeEvents(on, config) {
			config.env = {
				...process.env,
				...config.env,
			}
			config.trashAssetsBeforeRuns = true
			return 
			// implement node event listeners here
		},
	},
})
