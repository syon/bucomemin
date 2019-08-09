module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 8,
    parser: 'babel-eslint'
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-undef': 'error',
    'no-return-await': 'off'
  }
}
