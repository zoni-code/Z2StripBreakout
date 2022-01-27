const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const app = {
  mode: "development",
  entry: {
    "app": "./src/app/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          }
        ],
      },
      {
        test: /\.(mp3|png)$/,
        type: "asset/inline",
      }
    ],
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist/app",
    library: "StripBreakout",
    libraryExport: "default",
    libraryTarget: "umd",
    globalObject: "this",
  },
  resolve: {
    extensions: [
      ".ts", ".js",
    ],
  },
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
};

const generator = {
  mode: "development",
  entry: {
    "generator": "./src/generator/index.ts"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          }
        ],
      }
    ],
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist/generator"
  },
  resolve: {
    extensions: [
      ".ts", ".js",
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/generator/index.html", to: __dirname + "/dist/generator" },
        { from: "src/generator/assets", to: __dirname + "/dist/generator/assets" },
      ],
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version),
    }),
  ],
};

module.exports = [app, generator];
