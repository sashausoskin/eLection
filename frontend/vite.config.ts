import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/__test__/setupTests.ts'],
		// Vitest can't resolve public-dir assets imported as JS modules (e.g. `import x from '/img/icons/drag.svg'`)
		// on Windows: it builds an invalid `file:///img/...` URL missing the drive letter. Alias them to their
		// real filesystem path so Vite's normal asset pipeline handles them instead.
		alias: [
			{ find: /^\/img\//, replacement: path.resolve(dirname, 'public/img') + '/' }
		]
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
