const webpack = require('webpack'),
	config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

//config.mode = 'production';

webpack(config, function(err) {
	if (err) {
		throw err;
	}
});
