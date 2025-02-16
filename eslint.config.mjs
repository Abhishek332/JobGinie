import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    root: true,
  env: { browser: true, es2020: true, jest: true },
  ignorePatterns: ['.github/', '.next/', '.swc/', 'out/', 'node_modules/', 'eslint.config.mjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'next/core-web-vitals',
    'next/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:prettier/recommended', // sets up both eslint-plugin-prettier and eslint-config-prettier in one go
  ],
  plugins: ['prettier', 'unused-imports', 'tailwindcss', 'import'],
  globals: {
    JSX: 'readonly',
    React: 'readonly',
    NodeJS: 'readonly',
  },
  rules: {
    // Security Rules
    'no-eval': 'error',
    'no-new-func': 'error',
    'no-throw-literal': 'error',

    // Code Quality Rules
    'prefer-const': 'warn',
    camelcase: ['error', { properties: 'never' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',

    // Import & Sorting Rules
    'import/no-unresolved': 'error', // Ensure valid import paths
    'unused-imports/no-unused-imports': 'error',
    'import/no-anonymous-default-export': 'warn',
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
        ],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'import', next: 'function' },
      { blankLine: 'always', prev: 'function', next: 'function' },
    ],

    'no-undef': 'error', // Catch not defined variables
  },
  overrides: [
    {
      // Apply the override to API routes only
      files: ['app/api/**/*'],
      rules: {
        'no-console': 'off', // Disable `no-console` rule for API routes
      },
    },
  ],
  })
];

export default eslintConfig;
