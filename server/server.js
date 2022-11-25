import React from "react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
// import { createServer as createViteServer } from "vite";
import pkg from "react-server-dom-webpack/writer.node.server";
import { readFile } from "fs/promises";
// import App from '../dist'
import babelRegister from "@babel/register";
import Comp from "../dist/App.js";

const { renderToPipeableStream } = pkg;

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
    console.log(req.url);
    const stream = renderToPipeableStream(React.createElement(Comp));
    // console.log(stream);
    // serve index.html - we will tackle this next
    stream.pipe(res);
  });

  app.get("*", (req, res) => {
    console.log(req.url);
    res.end("pong!");
  });
  // app.use(express.static("dist"));

  app.listen(3000);
}

createServer();
