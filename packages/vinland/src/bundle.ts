import { isDevelopment, isProduction } from "./const";
import { rmSync } from "fs";
import path from "path";
import ReactServerWebpackPlugin from "react-server-dom-webpack/plugin";
import webpack, { Compiler } from "webpack";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

export enum CompilerType {
  Client,
  Server,
}

export const setupCompiler = ({ cwd }) => {
  let buildOutput = path.resolve(cwd, ".vinland");
  // if (routePath) {
  //   buildOutput = path.resolve(buildOutput, "routes");
  // }
  // const filename = routePath ? routePath.split("/").pop() : "";

  const compiler = webpack({
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    entry: {
      "main.js": [],
      // [routePath ? filename : "main"]: path.resolve(
      //   cwd,
      //   routePath ? `src/routes/${routePath}.jsx` : "src/main.jsx"
      // ),
      // "react-fast-refresh": require.resolve("./runtime"),
    },
    context: path.resolve(cwd),
    output: {
      publicPath: "/__vinland/",
      path: buildOutput,
      filename: "[name].js",
      chunkFilename: "[name].js",
    },
    resolve: {
      extensions: [".jsx", ".js", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.[jt]s|[jt]sx$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "swc-loader",
              options: {
                jsc: {
                  transform: {
                    react: {
                      development: isDevelopment,
                      // refresh: isDevelopment,
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
      // ...[
      //   isDevelopment &&
      //     new ReactRefreshWebpackPlugin({
      //       // overlay: {
      //       //   sockIntegration: require.resolve("./hmr-client")
      //       // },
      //     }),
      // ].filter(Boolean),
      new ReactServerWebpackPlugin({ isServer: false }),
      // new webpack.HotModuleReplacementPlugin(),
    ],
    // externals: {
    //   react: ["react", "react-dom"],
    // },
  });

  compiler.hooks.emit.tap("VinlandHMR", (stats) => {
    // console.log("VinlandHMR:", stats);
  });

  const serverCompiler = webpack({
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    entry: {
      "main.js": [],
      // [routePath ? filename : "main"]: path.resolve(
      //   cwd,
      //   routePath ? `src/routes/${routePath}.jsx` : "src/main.jsx"
      // ),
      // "react-fast-refresh": require.resolve("./runtime"),
    },
    context: path.resolve(cwd),
    output: {
      publicPath: "/__vinland/",
      path: buildOutput,
      filename: "[name].js",
      chunkFilename: "[name].js",
      libraryTarget: "commonjs2",
      globalObject: "this",
    },
    resolve: {
      extensions: [".jsx", ".js", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.[jt]s|[jt]sx$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "swc-loader",
              options: {
                jsc: {
                  transform: {
                    react: {
                      development: isDevelopment,
                      // refresh: isDevelopment,
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
      // ...[
      //   isDevelopment &&
      //     new ReactRefreshWebpackPlugin({
      //       // overlay: {
      //       //   sockIntegration: require.resolve("./hmr-client")
      //       // },
      //     }),
      // ].filter(Boolean),
      new ReactServerWebpackPlugin({ isServer: false }),
      // new webpack.HotModuleReplacementPlugin(),
    ],
    // externals: {
    //   react: ["react", "react-dom"],
    // },
  });

  return {
    [CompilerType.Client]: compiler,
    [CompilerType.Server]: serverCompiler,
  };
};

export const bundle = async ({
  compiler,
  cwd,
  routePath,
}: {
  compiler: Compiler;
  cwd: string;
  routePath?: string;
}) => {
  let buildOutput = path.resolve(cwd, ".vinland");
  if (routePath) {
    buildOutput = path.resolve(buildOutput, "routes");
  }

  if (!routePath) {
    rmSync(buildOutput, { recursive: true, force: true });
  }

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
