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
		//TODO: ignore console log errors
		'no-console': 'off',
		'no-mixed-spaces-and-tabs': ["warn", "smart-tabs"],
		"prettier/prettier": [
			"error",
			{
				"singleQuote": true,
				"semi": true,
				"tabWidth": 4,
				"printWidth": 100,
				"useTabs": true
			}
	], 
	"globals": {
		// false means don't override
		"chrome": false
	},
	"indent": [
		"warn",
		"tab"
	],
	"linebreak-style": [
		"error",
		"windows"
	],
	"quotes": [
		"error",
		"single"
	]
	}
};