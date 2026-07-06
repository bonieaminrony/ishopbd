import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '*.cjs', 'temp_extract/**/*']
  },
  {
    ...firebaseRulesPlugin.configs['flat/recommended'],
    rules: {
      ...firebaseRulesPlugin.configs['flat/recommended'].rules,
      '@firebase/security-rules/no-open-reads': 'off'
    }
  }
];
