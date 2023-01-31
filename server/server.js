import React from "react";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { renderToPipeableStream } from "react-server-dom-webpack/server";
import swc from "@swc/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function createServer() {
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  // const vite = await createViteServer({
  //   server: { middlewareMode: true },
  //   appType: "custom",
  // });

  // use vite's connect instance as middleware
  // if you use your own express router (express.Router()), you should use router.use
  // app.use(vite.middlewares);

  // app.get("/", async (req, res) => {
  //   // serve index.html - we will tackle this next
  //   const html = await readFile(path.resolve(__dirname, "../dist/index.html"));
  //   res.send(html.toString());
  // });

  app.get("/react", async (req, res) => {
    try {
      const comp = readFileSync(path.resolve(__dirname, "../src/Comp.jsx"), {
        encoding: "utf-8",
      });

      const { code } = await swc.transform(comp, {
        jsc: {
          parser: {
            syntax: "ecmascript",
            jsx: true,
          },
        },
        minify: false,
      });

      const writeToPath = path.resolve(__dirname, "../dist/Comp.js");

      // writeFile will cause nodemon restart. we need to ignore the out folder.
      writeFileSync(writeToPath, code, "utf-8");

      // cache query is to disable import caching.
      // https://github.com/nodejs/modules/issues/307
      const { default: Component } = await import(
        `../dist/Comp.js?cache=${Date.now()}`
      );

      setTimeout(async () => {
        // serialize component to stream
        const stream = renderToPipeableStream(React.createElement(Component));

        // serve index.html - we will tackle this next
        stream.pipe(res);
      }, 800);
    } catch (error) {
      console.error(error);
    }
  });

  app.get("*", (req, res) => {
    console.log(req.url);
    res.end("pong!");
    /**
     * ? how 'use client' work
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
  // app.use(express.static("dist"));

  app.listen(3000);
}

createServer();
