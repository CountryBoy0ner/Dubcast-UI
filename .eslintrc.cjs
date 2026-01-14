module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Use app + spec tsconfigs so both source and test files are parsed
    project: ['./tsconfig.app.json', './tsconfig.spec.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', '@angular-eslint', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@angular-eslint/recommended',
  ],
  rules: {
    // stylistic
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Angular specifics
    '@angular-eslint/no-empty-lifecycle-method': 'off',

    // Relax migration-heavy Angular rules to warnings for incremental cleanup
    '@angular-eslint/prefer-inject': 'warn',
    '@angular-eslint/prefer-standalone': 'warn',

    // Allow explicit any for now (warn) to avoid blocking lint runs
    '@typescript-eslint/no-explicit-any': 'warn',

    // Output alias checks may be noisy in this repo; warn instead of error
    '@angular-eslint/no-output-native': 'warn',

    // discourage console usage (allow warn/error)
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // unused imports autofix
    'unused-imports/no-unused-imports': 'warn'
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {},
    },
    {
      files: ['*.spec.ts', 'src/e2e/**'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
