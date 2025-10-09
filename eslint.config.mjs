// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default withNuxt()
  .append(prettierConfig)
  .append(
    {
      files: ['**/*.vue'],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: tsParser,
        },
      },
      plugins: {
        prettier: prettierPlugin,
      },
      rules: {
        'prettier/prettier': 'warn',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      languageOptions: {
        parser: tsParser,
      },
      plugins: {
        prettier: prettierPlugin,
      },
      rules: {
        'prettier/prettier': 'warn',
      },
    }
  )