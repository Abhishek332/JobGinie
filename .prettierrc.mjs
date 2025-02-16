/** @type {import("prettier").Config} */

const config = {
  semi: true,
  singleQuote: true,
  singleAttributePerLine: true,
  printWidth: 80,
  tabWidth: 2,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  plugins: ['prettier-plugin-tailwindcss'],
  proseWrap: 'always',
};

export default config;
