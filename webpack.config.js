const webpack = require('webpack'),
	path = require('path'),
/* 	fileSystem = require('fs'),
	env = require('./utils/env'), */
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	WriteFilePlugin = require('write-file-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	FileManagerWebpackPlugin = require('filemanager-webpack-plugin'),
	TerserPlugin = require('terser-webpack-plugin'),
	JSONMinifyPlugin = require('node-json-minify');/* ,
	ChromeExtensionReloaderPlugin = require('webpack-chrome-extension-reloader'); */

const env = (process.env.NODE_ENV || 'development').trim();

console.log(`env='${env}'`);
const debug = env.includes('dev');
console.log(`debug=${debug}`);



/* var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js'); */

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

/* if (fileSystem.existsSync(secretsPath)) {
	alias['secrets'] = secretsPath;
} */

var options = {
	mode: env,
	entry: {
		popup: path.join(__dirname, 'src', 'popup', 'popup.ts'),
		options: path.join(__dirname, 'src', 'options', 'options.ts'),
		boxSelect: path.join(__dirname, 'src', 'boxSelect', 'boxSelect.ts'),
		background: path.join(__dirname, 'src', 'background.ts'),
		globalStyles: path.join(__dirname, 'src', 'injected', 'globalStyles.scss'),
		script: path.join(__dirname, 'src', 'injected', 'script.ts'),
		documentStart: path.join(__dirname, 'src', 'injected', 'documentStart.ts')
	},
	chromeExtensionBoilerplate: {
		notHotReload: ['boxSelect']
	},
	optimization: {
		// Only on during production mode
		minimizer: !debug
			? [
					new TerserPlugin({
						terserOptions: {
							ecma: 6,
							comments: false,
							compress: {
								drop_console: true
							},
							output: {
								comments: false
							}
						}
					})
			  ]
			: []
	},
	output: {
		path: path.join(__dirname, 'build'),
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader'
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.(s*)css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
				exclude: /node_modules/
			},
			{
				test: /globalStyles\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},

					{
						loader: 'css-loader',
						options: {
							importLoaders: 1
						}
					},
					'postcss-loader',
					'sass-loader'
				]
			},
			{
				test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
				loader: 'file-loader?name=[name].[ext]',
				exclude: /node_modules/
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: {
							minimize: true
						}
					}
				]
			}
		]
	},
	/* Highly experimental change. */
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	plugins: [
		// clean the build folder
		new CleanWebpackPlugin(['build']),
		// expose and write the allowed env vars on the compiled bundle
		new webpack.EnvironmentPlugin(['NODE_ENV']),
		new CopyWebpackPlugin([
			{
				from: 'src/manifest.json',
				transform: function(content) {
					// generates the manifest file using the package.json informations
					return Buffer.from(
						JSON.stringify({
							description: process.env.npm_package_description,
							version: process.env.npm_package_version,
							...JSON.parse(content.toString())
						})
					);
				}
			},
/* 			{
				from: path.join(__dirname, 'src', 'injected', 'script.js'),
				transform: function(content) {
					return tsLoad
				}
			}, */
			{
				/* i18n */
				from: path.join(__dirname, 'src', '_locales'),
				transform: function(content) {
					// minify json
					return JSONMinifyPlugin(content.toString());
				},
				to: path.join(__dirname, 'build', '_locales')
			}
		]),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'popup', 'popup.html'),
			filename: 'popup.html',
			chunks: ['popup']
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'options', 'options.html'),
			filename: 'options.html',
			chunks: ['options']
		}),
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: '[name].css',
			chunkFilename: '[id].css'
		}),
		new FileManagerWebpackPlugin({
			onEnd: {
				delete: ['build/globalStyles.bundle.js']
			}
		}),
		new WriteFilePlugin()/* ,
		new webpack.SourceMapDevToolPlugin() *//* ,
		new ChromeExtensionReloaderPlugin({
			port: 9223, // Which port use to create the server
			reloadPage: true, // Force the reload of the page also
			entries: {
				contentScript: ['boxSelect'],
				background: 'background'
			}
		}) */
	]
};

if (debug) {
	/* options.devtool = 'source-map'; */
	options.devtool = 'cheap-eval-source-map';
	/* options.devtool = 'cheap-module-eval-source-map'; */
} else {
	/* options.devtool = 'false'; */
	options.devtool = 'eval';
	/* options.devtool = 'cheap-module-eval-source-map'; */
}

console.log(options);

module.exports = options;
