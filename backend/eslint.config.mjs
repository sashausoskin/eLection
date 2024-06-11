import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'


export default [
  {ignores: ['dist/', '*.config.js']},
  {files: ['**/*.js'], languageOptions: {sourceType: 'commonjs'}},
  {languageOptions: { globals: globals.browser }},
  {rules: {
    eqeqeq: 'error',
    semi: ['error', 'never'],
    quotes: ['error', 'single']
  }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]