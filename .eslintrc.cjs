/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  root: true,
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['node_modules/'],
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
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': false,
        },
      },
    ],
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
    'import/order': [
      'error',
      {
        groups: [
          ['external', 'builtin'],
          ['type', 'internal', 'object'],
          ['parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: '@/type/*',
            group: 'external',
          },
          {
            pattern: '{../types, ../types/*}',
            group: 'type',
          },
          {
            pattern: '../interfaces',
            group: 'type',
          },
          {
            pattern: '{../utils/**, ../utils/*}',
            group: 'type',
          },
          {
            pattern: '../constants',
            group: 'type',
          },
          {
            pattern: '../middlewares',
            group: 'index',
          },
          {
            pattern: '../schemas/*',
            group: 'index',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
      },
    ],
  },
};
