export default [
  {
    files: ['orig/src/**/*.{js,jsx}'],
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
