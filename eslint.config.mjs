import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import importPlugin from 'eslint-plugin-import'

const config = [
  prettierConfig,
  prettierPluginRecommended,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,ts}'],
    plugins: { import: importPlugin },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'unknown', ['parent', 'sibling', 'index']],
          pathGroupsExcludedImportTypes: ['builtin'],
          pathGroups: [],
        },
      ],
    },
    settings: {
      version: 'detect',
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import/extensions': ['.ts', '.tsx'],
    },
  },
  { ignores: ['dist/*'] },
]

export default config
