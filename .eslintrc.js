module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "plugins": ["prettier"],
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
    },
    "rules": {
        "prettier/prettier": [
            "error",
            {
                "singleQuote": true,
                "semi": true,
                "tabWidth": 4,
                "printWidth": 100
            }
    ],
/*         "indent": [
            "warn",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ] */
    }
};