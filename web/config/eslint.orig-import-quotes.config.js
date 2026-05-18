export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    rules: {
      'no-restricted-syntax': ['error', {
        selector: 'ImportDeclaration[source.raw=/^".*"$/]',
        message: 'Use single quotes for import source strings.',
      }],
    },
  },
];
