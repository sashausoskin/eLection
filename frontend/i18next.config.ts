import { defineConfig } from 'i18next-cli';

export default defineConfig({
  "locales": [
    "en",
    "fi"
  ],
  "extract": {
    "input": "./public/locales/$NAMESPACE/$LOCALE.json",
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
      "locales/{{language}}/{{namespace}}.json"
    ],
    "output": "src/types/i18next.d.ts"
  }
});