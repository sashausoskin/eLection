import { defineConfig } from 'i18next-cli';

export default defineConfig({
  "locales": [
    "en",
    "fi"
  ],
  "extract": {
    "input": ["src/**/*.{ts,tsx}"],
    "output": "./public/locales/{{namespace}}/{{language}}.json",
    "defaultNS": "translation",
    "keySeparator": ".",
    "nsSeparator": ":",
    "contextSeparator": "_",
    "functions": [
      "t",
      "*.t"
    ],
    "transComponents": [
      "Trans"
    ]
  },
  "types": {
    "input": [
      "src/**/*.{ts,tsx}"
    ],
    "output": "src/types/i18next.d.ts"
  }
});