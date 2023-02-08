import React, { Suspense, use } from "react";
import ReactDOM from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("__vinland"));

let index = createFromFetch(fetch("/__vinland/index"));

const socket = new window.WebSocket("ws://localhost:3000/__vinland/hmr");

socket.onopen = () => {
  console.log("open");
};
socket.onmessage = ({ data }) => {
  switch (data) {
    case "file-updated":
      window.location.reload();
      break;
  }
};

const App = () => {
  const app = use(index);
  const ping = () => {
    socket.send("ping");
  };
  return (
    <>
      {app}
      <button onClick={ping}>ping</button>
    </>
  );
};

root.render(
  <ErrorBoundary>
    <Suspense>
      <App />
    </Suspense>
  </ErrorBoundary>
);
