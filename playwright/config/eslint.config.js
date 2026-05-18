import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
  js.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
      },
    },
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', 'stroustrup', {allowSingleLine: true}],
      '@stylistic/generator-star-spacing': ['error', {after: false, before: true}],
      '@stylistic/keyword-spacing': ['error', {
        overrides: {
          catch: {after: true},
          for: {after: false},
          if: {after: false},
          switch: {after: false},
          while: {after: false},
        },
      }],
      '@stylistic/max-len': ['error', {code: 155}],
      '@stylistic/max-statements-per-line': ['error', {max: 2}],
      '@stylistic/no-multiple-empty-lines': ['error', {max: 2, maxBOF: 0, maxEOF: 1}],
      '@stylistic/object-curly-spacing': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        asyncArrow: 'always',
        catch: 'never',
        named: 'never',
      }],
      'complexity': ['error', 5],
      'curly': ['error', 'all'],
      'max-lines': ['error', {max: 100, skipBlankLines: true}],
      'max-lines-per-function': ['error', {max: 20, skipBlankLines: true, skipComments: true}],
    },
  },
  {
    files: ['**/*.spec.js'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
];
