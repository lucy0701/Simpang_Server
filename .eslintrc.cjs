/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'only-warn'],
  root: true,
  env: {
    node: true,
  },
  rules: {
    semi: 'off',
    'arrow-body-style': ['error', 'as-needed'],
    indent: 'off',
    quotes: 'off',
    'comma-dangle': 'off',
    'no-console': 'off',
    'no-debugger': 'error',
    'no-trailing-spaces': 'warn',
    'jsx-quotes': ['error', 'prefer-double'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'eol-last': 'error',
  },
};
