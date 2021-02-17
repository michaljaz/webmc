module.exports = {
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    env: {
        browser: true,
        es6: true,
        node: true,
        jquery: true,
    },
    parserOptions: {
        ecmaVersion: 8,
        sourceType: "module",
    },
    rules: {
        "no-empty": ["error", { allowEmptyCatch: true }],
    },
    globals: {
        PRODUCTION: true,
    },
};
