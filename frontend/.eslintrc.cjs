module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'jsx-a11y'],
  overrides: [
    {
      // Allow CommonJS require() in Electron main process
      files: ['electron/**/*.ts', 'electron/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // ===== Accessibility Rules (WCAG 2.1 Level AA) =====
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/tabindex-no-positive': 'warn',

    // ===== Performance Rules =====
    // Detect MUI barrel imports (adds 200-300KB to bundle)
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@mui/material',
            message:
              'Use path imports to enable tree-shaking: import Button from "@mui/material/Button"',
          },
          {
            name: '@mui/icons-material',
            message:
              'Use path imports to enable tree-shaking: import AddIcon from "@mui/icons-material/Add"',
          },
        ],
      },
    ],

    // ===== Design System Rules =====
    // Note: These are warnings to guide developers, not hard errors
    // Hardcoded values should use design tokens instead

    // Warn on potential hardcoded colors (basic regex check)
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,6}/]',
        message: 'Avoid hardcoded hex colors. Use theme.palette.* or theme.tokens.colors.* instead.',
      },
      {
        selector: 'Literal[value=/rgb\\(/]',
        message: 'Avoid hardcoded RGB colors. Use theme.palette.* or theme.tokens.colors.* instead.',
      },
      {
        selector: 'Literal[value=/rgba\\(/]',
        message: 'Avoid hardcoded RGBA colors. Use theme.palette.* with alpha instead.',
      },
    ],

    // TypeScript best practices
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],

    // React best practices
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
