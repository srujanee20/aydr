const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        files: ['**/*.{js,cjs}'],
        ...js.configs.recommended
    },
    {
        files: ['**/*.{js,cjs}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: globals.node
        },
        rules: {
            'no-unused-vars': 'off',
            'indent': ['warn', 4],
            'semi': ['warn', 'always'],
            'comma-dangle': ['error', 'never'],
            'space-before-function-paren': ['error', {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always'
            }]
        }
    }
];