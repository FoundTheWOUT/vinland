import React from "react";
import register from "react-server-dom-webpack/node-register";
import {
  readFileSync,
  writeFileSync,
  watchFile,
  createWriteStream,
  accessSync,
  mkdir,
  mkdirSync,
} from "fs";
import path from "path";
import express from "express";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import swc from "@swc/core";
import morgan from "morgan";
import bodyParser from "body-parser";
import ws from "ws";
import { PORT } from "./const";
import { bundle, CompilerType, setupCompiler } from "./bundle";

register();

const todoList = [{ label: "test" }];
const addTodo = (item) => {
  todoList.push(item);
};

const root = process.argv[2];
if (!root) {
  throw Error("please specify root argument");
}
console.log("Root Path:", path.resolve(root));

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const pipeComponentToRes = (comp, res) => {
  // serialize component to stream
  const manifest = readFileSync(
    path.join(root, "./.vinland/react-client-manifest.json"),
    "utf-8"
  );
  const moduleMap = JSON.parse(manifest);
  const stream = renderToPipeableStream(React.createElement(comp), {
    clientManifest: moduleMap,
  });
  // serve index.html - we will tackle this next
  stream.pipe(res);
};

async function createServer() {
  const compiles = setupCompiler({ cwd: root });

  const ensureServerComponent = async (
    name: string,
    options?: { routePath: string }
  ) => {
    let { routePath = "" } = options ?? {};

    try {
      if (routePath.startsWith("/__vinland")) {
        const splitted = routePath.split("/");
        splitted.splice(1, 1);
        routePath = splitted.join("/");
        await bundle({
          compiler: compiles[CompilerType.Server],
          cwd: root,
          routePath,
        });
      }
      const requirePath = path.resolve(
        root,
        routePath
          ? `.vinland/routes${routePath}.js`
          : name === "index"
          ? `../dist/App.jsx`
          : `../dist/${name}.server.jsx`
      );

      // cache query is to disable import caching.
      // https://github.com/nodejs/modules/issues/307
      // const { default: Component } = await import(
      //   `${outputPath}?cache=${Date.now()}`
      // );
      const Mod = require(requirePath);

      return {
        Component: Mod.default,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // pre bundle
  console.log("pre bundling...");
  await bundle({ compiler: compiles[CompilerType.Client], cwd: root });
  // .vinland folder created

  const LOG_PATH = path.resolve(root, ".vinland", "access.log");
  try {
    accessSync(LOG_PATH);
  } catch (error) {
    writeFileSync(LOG_PATH, "");
  }
  const accessLogStream = createWriteStream(LOG_PATH, { flags: "a" });

  const wsServer = new ws.Server({ noServer: true });

  const app = express();
  app
    // .use(bodyParser.json())
    .use(morgan("common"))
    .use(morgan("common", { stream: accessLogStream })) //logger
    .use("/__vinland", express.static(path.resolve(root, ".vinland")));

  // const vite = await createViteServer({
  //   root,
  //   server: { middlewareMode: true },
  //   appType: "spa",
  // });
  app.get("/ping", (req, res) => {
    return res.send("pong");
  });

  app.get("/react", async (req, res) => {
    const { Component } = await ensureServerComponent("Comp");
    try {
      setTimeout(async () => {
        pipeComponentToRes(Component, res);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  });

  app.get("/todos", async (req, res) => {
    res.json(todoList);
  });

  app.post("/todo", async (req, res) => {
    if (req.body.label == "error") {
      res.sendStatus(400);
    } else {
      addTodo(req.body);
      res.end("success");
    }
  });

  app.get("/todo", async (req, res) => {
    const { Component } = await ensureServerComponent("Todo");
    try {
      setTimeout(async () => {
        pipeComponentToRes(Component, res);
      }, 800);
    } catch (error) {
      console.error(error);
    }
  });

  app.get("/__vinland/index", async (req, res) => {
    const { Component } = await ensureServerComponent("index", {
      routePath: "/__vinland/index",
    });
    pipeComponentToRes(Component, res);
  });

  app.get("/", (req, res) => {
    const html = readFileSync(path.join(root, "./index.html"), "utf-8");
    // try to bundle page
    res.end(html);
    /**
     * ? Next.js 13, how 'use client' work
     *
     * * Next.js currently compile tsx file through swc. And determine whether the component is server or client.(search 'use client' in body)
     * * When using some invalid api in server component, for example, importing 'useState', it will emit error.
     *
     * 1. Match the route, the information of the route should tell us where to 'import' the Component, which means the route is mapped
     *    to the path of the Component in some strategy.
     * 2. The importing Component should be compiled to js, if it's jsx still, we need some technic such as webpack loader to compile if first.
     *    In Next.js, the renderer itself is a tsx file.
     * 3. Finally, we pipe the stream to the client, and the client will get the rendered component, we can use the 'use' hook await the res, then
     *    render it like other children component.
     */
  });
  // app.use(vite.middlewares);

  const server = app.listen(PORT, () => {
    console.log(`running server on http://localhost:${PORT}/`);
  });

  server.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, req.socket, head, (client) => {
      watchFile(path.join(root, "./src/main.jsx"), () => {
        client.send("file-updated");
      });
      client.addEventListener("message", ({ data }) => {
        // console.log(data);
      });
    });
  });
}

createServer();
