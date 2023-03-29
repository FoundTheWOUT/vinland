import { isDevelopment, isProduction } from "./const";
import { rmSync } from "fs";
import path from "path";
import ReactServerWebpackPlugin from "react-server-dom-webpack/plugin";
import webpack from "webpack";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

export const bundle = async ({ cwd, routePath = undefined }) => {
  let buildOutput = path.resolve(cwd, ".vinland");
  if (routePath) {
    buildOutput = path.resolve(buildOutput, "routes");
  }
  const filename = routePath ? routePath.split("/").pop() : "";

  if (!routePath) {
    rmSync(buildOutput, { recursive: true, force: true });
  }

  const compiler = webpack({
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    entry: {
      [routePath ? filename : "main"]: path.resolve(
        cwd,
        routePath ? `src/routes/${routePath}.jsx` : "src/main.jsx"
      ),
    },
    context: path.resolve(cwd),
    output: {
      publicPath: "/__vinland/",
      path: buildOutput,
      filename: "[name].js",
      chunkFilename: "[name].js",
      libraryTarget: "commonjs2",
      globalObject: routePath ? "this" : "self",
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
          test: /\.[jt]sx$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "swc-loader",
              options: {
                jsc: {
                  transform: {
                    react: {
                      development: isDevelopment,
                      refresh: isDevelopment,
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
      //   new HtmlWebpackPlugin({
      //     inject: true,
      //     template: path.resolve(cwd, "../public/index.html"),
      //   }),
      // ...[isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean),
      new ReactRefreshWebpackPlugin(),
      new ReactServerWebpackPlugin({ isServer: false }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  });

  compiler.hooks.emit.tap("VinlandHMR", (stats) => {
    // console.log("VinlandHMR:", stats);
  });

  const watching = await new Promise((res) => {
    // watch method will trigger webpack compiler
    const watcher = compiler.watch(
      {
        aggregateTimeout: 5,
        ignored: ["**/.vinland/**"],
      },
      (stat) => {
        res(watcher);
      }
    );
  });
};
