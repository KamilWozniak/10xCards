// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default withNuxt().append(
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
  }
)
