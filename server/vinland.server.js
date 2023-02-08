const React = require("react");
const register = require("react-server-dom-webpack/node-register");
register();
const { readFileSync, writeFileSync, watchFile } = require("fs");
const path = require("path");
const express = require("express");
const { renderToPipeableStream } = require("react-server-dom-webpack/server");
const swc = require("@swc/core");
const { createServer: createViteServer } = require("vite");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const ws = require("ws");

const todoList = [{ label: "test" }];
const addTodo = (item) => {
  todoList.push(item);
};

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const ensureServerComponent = async (name) => {
  try {
    const comp = readFileSync(
      path.resolve(
        __dirname,
        name === "index" ? `../src/App.jsx` : `../src/${name}.server.jsx`
      ),
      {
        encoding: "utf-8",
      }
    );

    const { code } = await swc.transform(comp, {
      jsc: {
        parser: {
          jsx: true,
        },
      },
      minify: false,
      module: {
        type: "commonjs",
      },
    });

    const outputPath = `../dist/${name}.server.js`;
    const writeToPath = path.resolve(__dirname, outputPath);

    // writeFile will cause nodemon restart. we need to ignore the out folder.
    writeFileSync(writeToPath, code, "utf-8");

    // cache query is to disable import caching.
    // https://github.com/nodejs/modules/issues/307
    // const { default: Component } = await import(
    //   `${outputPath}?cache=${Date.now()}`
    // );
    const Mod = requireUncached(outputPath);

    return {
      Component: Mod.default,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const pipeComponentToRes = (comp, res) => {
  // serialize component to stream
  const manifest = readFileSync("./build/react-client-manifest.json", "utf-8");
  const moduleMap = JSON.parse(manifest);
  const stream = renderToPipeableStream(React.createElement(comp), {
    clientManifest: moduleMap,
  });
  // serve index.html - we will tackle this next
  stream.pipe(res);
};

async function createServer() {
  const wsServer = new ws.Server({ noServer: true });

  const app = express();
  app.use(bodyParser.json());
  app.use(morgan("tiny"));

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
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
    const { Component } = await ensureServerComponent("index");
    pipeComponentToRes(Component, res);
  });

  app.get("/", (req, res) => {
    const html = readFileSync("./index.html", "utf-8");
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
  // app.use("/build", express.static("build"));
  app.use(vite.middlewares);

  const server = app.listen(3000, () => {
    console.log("running server on http://localhost:3000/");
  });

  server.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, req.socket, head, (client) => {
      watchFile("./src/App.jsx", () => {
        client.send("file-updated");
      });
      client.addEventListener("message", ({ data }) => {
        console.log(data);
      });
    });
  });
}

createServer();
