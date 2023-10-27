import * as path from 'path';
import * as webpack from 'webpack';

const isProd = process.env.NODE_ENV === 'production';
const isLambda = process.env.BUILD_TO === 'lambda';

const config: webpack.Configuration = {
  entry: isLambda ? './src/lambda.ts' : './src/main.ts',
  mode: isProd ? 'production' : 'development',
  target: 'node14',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: isProd ? undefined : 'inline-source-map',
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  externals: [{ express: { commonjs: 'express' } }],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  plugins: [new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ })],
};

export default config;
