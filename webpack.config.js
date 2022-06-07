
const path = require('path');
const { ProvidePlugin, DefinePlugin } = require('webpack');

/**
 * wunderwerk webpack file.
 */

/**
 * Variables.
 */
const isDev = process.env.NODE_ENV === 'dev';

/**
 * Webpack config.
 */
module.exports = [
  {
    entry: {
      'worker': path.resolve('./src/worker.ts'),
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : false,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        document: JSON.stringify({URL: 'http://localhost'}),
      }),
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: "process/browser",
      }),
    ],
    output: {
      path: path.resolve('./dist'),
      filename: '[name].js',
      chunkFilename: '[name].js?id=[chunkhash]',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        stream: require.resolve('stream-browserify'),
      },
    },
  },
];
