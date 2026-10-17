import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['server/**/*.ts', '*.config.{js,ts}', 'client/vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Leak guard: all server→client traffic goes through net/outbox.ts as
  // per-socket emits of per-player projections. Never broadcast.
  {
    files: ['server/src/**/*.ts'],
    ignores: ['server/src/net/outbox.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='emit']",
          message: 'Only server/src/net/outbox.ts may emit to clients.',
        },
        {
          selector: "MemberExpression[property.name='broadcast']",
          message: 'Broadcasting is banned: send per-player views via the outbox.',
        },
      ],
    },
  },
  {
    files: ['server/src/net/outbox.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='broadcast']",
          message: 'Broadcasting is banned: send per-player views via the outbox.',
        },
        {
          selector: "CallExpression[callee.property.name='emit'][callee.object.type!='Identifier']",
          message:
            'Emit only on a single socket variable, e.g. socket.emit(...), never io.to(...).emit.',
        },
        {
          selector: "CallExpression[callee.property.name='emit'][callee.object.name='io']",
          message: 'io.emit broadcasts to everyone: emit on a single socket instead.',
        },
      ],
    },
  },
  // Projection must build views field by field from an allowlist.
  {
    files: ['server/src/visibility/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ObjectExpression > SpreadElement',
          message: 'No object spread in visibility/: copy allowed fields explicitly.',
        },
        {
          selector: "CallExpression[callee.property.name='emit']",
          message: 'Only server/src/net/outbox.ts may emit to clients.',
        },
      ],
    },
  },
  prettier,
);
