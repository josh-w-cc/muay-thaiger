import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    jsx: true,
    quotes: 'single',
    semi: true,
  }),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
      },
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'off',
      'curly': ['error', 'all'],
      'complexity': ['error', 5],
      'max-lines': ['error', {
        max: 100,
        skipBlankLines: true,
      }],
      'max-lines-per-function': ['error', {
        max: 20,
        skipBlankLines: true,
        skipComments: true,
      }],
      'react/jsx-uses-vars': 'error',
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', 'stroustrup', {allowSingleLine: true}],
      '@stylistic/generator-star-spacing': ['error', {
        before: true,
        after: false,
      }],
      '@stylistic/keyword-spacing': ['error', {
        overrides: {
          catch: {after: false},
          for: {after: false},
          if: {after: false},
          switch: {after: false},
          while: {after: false},
        },
      }],
      '@stylistic/max-len': ['error', {code: 155}],
      '@stylistic/no-multiple-empty-lines': ['error', {max: 2, maxBOF: 0, maxEOF: 1}],
      '@stylistic/max-statements-per-line': ['error', {max: 1}],
      '@stylistic/object-curly-spacing': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        asyncArrow: 'always',
        catch: 'never',
        named: 'never',
      }],
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    ignores: ['dist/', 'orig/'],
  },
];
