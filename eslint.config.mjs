import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'no-console': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // React 19 compiler hints — disabled because they flag correct patterns
      // (config hydration, SSR mount guards, ref-sync, Math.random in useMemo)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/static-components': 'off'
    }
  },
  {
    ignores: ['__CLEANUP__/**', 'landing-page/**', 'fin/**', 'src/app/(landing)/**', 'src/app/sv/**', 'src/app/fin-pages/**']
  }
];

export default eslintConfig;
