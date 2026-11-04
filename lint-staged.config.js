export default {
  '*.{js,ts}': ['prettier --check', 'eslint --max-warnings 0'],
  '*.{json,css,html,md,yml,yaml}': 'prettier --check',
};
