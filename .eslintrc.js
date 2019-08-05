module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'linebreak-style': 'off',
    'max-len': [
      'error',
      {
        code: 80,
        ignoreStrings: true,
        ignoreUrls: true,
      },
    ],
    'import/extensions': 0,
    'no-param-reassign': 0,
    'no-return-assign': 0,
    'implicit-arrow-linebreak': 0,
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'react/destructuring-assignment': 0,
    'react/no-access-state-in-setstate': 0,
    'react/no-did-update-set-state': 0,
    'function-paren-newline': ['error', 'consistent'],
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'no-case-declarations': 0,
    'class-methods-use-this': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'jsx-a11y/mouse-events-have-key-events': 0,
    'react/prop-types': 0,
  },
};
