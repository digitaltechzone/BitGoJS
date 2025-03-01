const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const mode = process.env.NODE_ENV ?? 'production';

module.exports = {
  mode,
  target: 'web',
  entry: path.join(__dirname, '/dist/src/index.js'),
  output: {
    path: path.join(__dirname, '/dist/browser'),
    filename: 'bitgo-account-lib.js',
    library: 'bitgo-account-lib',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      '@hashgraph/sdk': path.resolve('../../node_modules/@hashgraph/sdk/src/browser.js'),
    },
    fallback: {
      buffer: require.resolve('buffer'),
      constants: false,
      crypto: require.resolve('crypto-browserify'),
      dns: false,
      fs: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      http2: false,
      net: false,
      os: false,
      path: false,
      stream: require.resolve('stream-browserify'),
      tls: false,
      url: require.resolve('url/'),
      vm: false,
      zlib: false,
    },
  },
  externals: ['morgan', 'superagent-proxy'],
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  node: {
    global: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
          warnings: true,
          mangle: false,
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};
