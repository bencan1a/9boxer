module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', 'dist-electron', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh', 'react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Prevent hardcoded user-facing strings in JSX (i18n enforcement)
    // Note: This rule is intentionally lenient to allow technical configuration props
    // Only text content (children) should be translated, not technical prop values
    'react/jsx-no-literals': [
      'warn',
      {
        noStrings: true,
        allowedStrings: [
          // Allow single characters and symbols
          '/',
          '-',
          '•',
          ':',
          '—',
          '(',
          ')',
          ',',
          '.',
          '%',
          '+',
          '&',
          '*',
          '=',
          '<',
          '>',
          // Allow empty strings
          '',
        ],
        // Don't check props - technical config values don't need translation
        ignoreProps: true,
        // Technical attributes like data-testid, className, id don't need translation
        noAttributeStrings: false,
      },
    ],
    // Turn off prop-types validation (we use TypeScript)
    'react/prop-types': 'off',
  },
};
