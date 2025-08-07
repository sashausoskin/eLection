import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import { fixupConfigRules } from '@eslint/compat';
import tsParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc';

export default tseslint.config({
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.config.ts"],
    languageOptions: {
        globals: {
            ...globals.browser
        },
        parser: tsParser,
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        eslintReact.configs['recommended-typescript']
    ],
    plugins: {
        "@stylistic": stylistic,
        "react-refresh": reactRefresh
    },
    rules: {
        "react-refresh/only-export-components": ["warn", {
            allowConstantExport: true,
        }],

        "eqeqeq": "error",
        semi: ["error", "never"],
        quotes: ["error", "single"],
        "@stylistic/indent": ["error", "tab"],
    },
})

/*
module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
    },

    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
    )),

    plugins: {
        "react-refresh": reactRefresh,
        "@stylistic": stylistic
    },

    rules: {
        "react-refresh/only-export-components": ["warn", {
            allowConstantExport: true,
        }],

        "eqeqeq": "error",
        semi: ["error", "never"],
        quotes: ["error", "single"],
        "@stylistic/indent": ["error", "tab"],
    },
}, 
*/
// globalIgnores(["**/dist", "**/.eslintrc.cjs"]), globalIgnores(["**/node_modules", "**/dist"])]);
