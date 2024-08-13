const rspack = require('@rspack/core');
const Dotenv = require('dotenv-webpack');
const fs = require('fs'); // to check if the file exists
const path = require('path'); // to get the current path

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = () => {
  const currentPath = path.join(__dirname);
  const basePath = currentPath + '/.env';
  const envPath = basePath + '.' + process.env.NODE_ENV;
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;

  return {
    context: __dirname,
    entry: {
      main: './src/main.js',
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
    },
    output: {
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          type: 'asset',
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                sourceMap: true,
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                  },
                  experimental: {
                    plugins: [['@lingui/swc-plugin', {}]],
                  },
                  transform: {
                    react: {
                      runtime: 'automatic',
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new rspack.HtmlRspackPlugin({
        template: './index.html',
        favicon: './src/assets/favicon_canadaFlag.ico',
      }),
      new Dotenv({
        path: finalPath, // Path to .env file (this is the default)
        safe: true, // load .env.example (defaults to "false" which does not use dotenv-safe)
      }),
    ],
  };
};
