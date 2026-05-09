import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/__test__/setupTests.ts']
	},
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					// Since the exceljs is massive, split it so that it only gets loaded when it is needed.
					groups:[
						{
							test: /node_modules\/exceljs/,
							name: 'exceljs'
						}
					]
				}
			}
		},
		chunkSizeWarningLimit: 1000
	}
})
