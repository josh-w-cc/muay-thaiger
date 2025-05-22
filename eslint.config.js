import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
  {ignores: ['dist']},
  {
    files: ['**/*.js', '**/*.jsx'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {jsx: true},
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic/js': stylisticJs,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'brace-style': ['error', 'stroustrup'],
      'complexity': ['error', 5],
      'generator-star-spacing': ['error', {'before': true, 'after': false}],
      'keyword-spacing': [
        'error', {
          'overrides': {
            'catch': {'after': false},
            'for': {'after': false},
            'if': {'after': false},
            'switch': {'after': false},
            'while': {'after': false},
          },
        },
      ],
      'max-len': ['error', {'code': 155, 'ignoreRegExpLiterals': true}],
      'no-multiple-empty-lines': ['error', {'max': 2, 'maxBOF': 0, 'maxEOF': 1}],
      'no-param-reassign': ['error', {'props': false}],
      'no-plusplus': 'off',
      'no-unused-vars': 'error',
      'no-use-before-define': 'off',
      'object-curly-spacing': ['error', 'never'],
      'prefer-template': 'off',
      'react/jsx-max-props-per-line': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-no-bind': 'off',
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': [
        'warn',
        {allowConstantExport: true},
      ],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/semi': 'error',
      '@stylistic/js/quotes': ['error', 'single'],
    },
  },
];
