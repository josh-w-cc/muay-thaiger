export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    rules: {
      quotes: ['error', 'single'],
    },
  },
];
