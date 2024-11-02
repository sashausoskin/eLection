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
		rollupOptions: {
			output: {
				manualChunks: {
					exceljs: ['exceljs']
				}
			}
		},
		chunkSizeWarningLimit: 1000
	}
})
