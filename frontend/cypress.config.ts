import { config } from 'dotenv'
config()
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env = {
        ...process.env,
        ...config.env
      }
      return
      // implement node event listeners here
    },
  },
});
