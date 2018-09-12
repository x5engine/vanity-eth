const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PrerenderSpaPlugin = require('prerender-spa-plugin');

module.exports = {
	entry: {
		index: './src/main.js'
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/dist/',
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {extractCSS: process.env.NODE_ENV === 'production'}
			},
			{
				test: /vanity\.js$/,
				loader: 'worker-loader',
				exclude: /node_modules/,
				options: {
					inline: true,
					name: 'vanity.js'
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(png|woff|woff2)/,
				exclude: /node_modules/,
				loader: 'url-loader'
			}
		]
	},
	resolve: {
		alias: {
			vue$: 'vue/dist/vue.esm.js'
		},
		extensions: ['*', '.js', '.vue', '.json']
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		overlay: true
	},
	performance: {
		hints: false
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV),
				TID: JSON.stringify(process.env.TID)
			}
		}),
		new CopyWebpackPlugin([{
			from: 'src/assets/images/favicon.ico',
			to: '.',
			toType: 'dir'
		}])
	]
};

if (process.env.NODE_ENV === 'production') {
    // http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = (module.exports.plugins || []).concat([
		new ExtractTextPlugin('style.css'),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),
		new PrerenderSpaPlugin({
			staticDir: path.join(__dirname),
			routes: ['/'],
			minify: {
				collapseBooleanAttributes: true,
				decodeEntities: true,
				sortAttributes: true
			},
            postProcess (renderedRoute) {
                renderedRoute.html = renderedRoute.html.replace('render', 'prerender');
                return renderedRoute
            },
		})
	]);
}
