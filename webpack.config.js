/* eslint-disable indent */
const webpack = require('webpack'),
	path = require('path'),
	fileSystem = require('fs'),
	env = require('./utils/env'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	WriteFilePlugin = require('write-file-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	FileManagerWebpackPlugin = require('filemanager-webpack-plugin'),
	TerserPlugin = require('terser-webpack-plugin'),
	JSONMinifyPlugin = require('node-json-minify');

require('dotenv').config();

const debug = process.env.NODE_ENV !== 'production';

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

if (fileSystem.existsSync(secretsPath)) {
	alias['secrets'] = secretsPath;
}

var options = {
	mode: process.env.NODE_ENV || 'development',
	entry: {
		popup: path.join(__dirname, 'src', 'js', 'popup.js'),
		options: path.join(__dirname, 'src', 'js', 'options.js'),
		boxSelect: path.join(__dirname, 'src', 'js', 'box-select.js'),
		background: path.join(__dirname, 'src', 'js', 'background.js'),
		globalStyles: path.join(__dirname, 'src', 'injected', 'globalStyles.scss')
	},
	chromeExtensionBoilerplate: {
		notHotReload: ['boxSelect']
	},
	optimization: {
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
	resolve: {
		alias: alias
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
			{
				from: path.join(__dirname, 'src', 'injected', 'script.js')
			},
			{
				/* i18n */
				from: path.join(__dirname, 'src', '_locales'),
				transform: function(files) {
					// minify json
					files.forEach(file => console.log(file));
					//return JSONMinifyPlugin(content);
				},
				to: path.join(__dirname, 'build', '_locales')
			}
		]),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'popup.html'),
			filename: 'popup.html',
			chunks: ['popup']
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'options.html'),
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
		new WriteFilePlugin()
	]
};

if (debug) {
	options.devtool = 'cheap-module-eval-source-map';
} else {
	options.devtool = 'false';
	options.performance = {
		hints: 'error'
	};
}

console.log(options);

module.exports = options;
