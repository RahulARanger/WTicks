module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        "next/core-web-vitals",
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:material-ui/recommended',
        'prettier',
        'prettier/react',
    ],
    rules: {
        "no-unused-vars": "error",
        'react/require-returns': 'error'
    },
};
