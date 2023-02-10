import { isProduction } from "./const";
import { rmSync } from "fs";
import path from "path";
import ReactServerWebpackPlugin from "react-server-dom-webpack/plugin";
import webpack from "webpack";

export const bundle = ({ cwd }) => {
  return new Promise((resolve, reject) => {
    const buildOutput = path.resolve(cwd, "build");

    rmSync(buildOutput, { recursive: true, force: true });
    const compiler = webpack({
      mode: isProduction ? "production" : "development",
      devtool: isProduction ? "source-map" : "cheap-module-source-map",
      entry: [path.resolve(cwd, "src/main.jsx")],
      context: path.resolve(cwd),
      output: {
        path: buildOutput,
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
        //     template: path.resolve(cwd, "../public/index.html"),
        //   }),
        new ReactServerWebpackPlugin({ isServer: false }),
      ],
    });
    compiler.run((err, stats) => {
      if (err) {
        const reason = err.stack ?? err.toString();
        if (reason) {
          return resolve({
            errors: [{ message: reason, details: (err as any).details }],
            warnings: [],
            stats,
          });
        }
        return reject(err);
      }
      return resolve("Finished running webpack.");
    });
  });
};
