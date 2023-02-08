const { rmSync } = require("fs");
const path = require("path");
const ReactServerWebpackPlugin = require("react-server-dom-webpack/plugin");
const webpack = require("webpack");

const isProduction = process.env.NODE_ENV === "production";
rmSync(path.resolve(__dirname, "../build"), { recursive: true, force: true });
webpack(
  {
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    entry: [path.resolve(__dirname, "../src/main.jsx")],
    output: {
      path: path.resolve(__dirname, "../build"),
      filename: "main.js",
    },
    resolve: {
      extensions: [".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.jsx$/,
          use: "swc-loader",
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      //   new HtmlWebpackPlugin({
      //     inject: true,
      //     template: path.resolve(__dirname, "../public/index.html"),
      //   }),
      new ReactServerWebpackPlugin({ isServer: false }),
    ],
  },
  (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      process.exit(1);
      return;
    }
    const info = stats.toJson();
    if (stats.hasErrors()) {
      console.log("Finished running webpack with errors.");
      info.errors.forEach((e) => console.error(e));
      process.exit(1);
    } else {
      console.log("Finished running webpack.");
    }
  }
);
