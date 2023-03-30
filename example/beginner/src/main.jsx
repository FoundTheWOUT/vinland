import React, { Suspense, use, useState } from "react";
import ReactDOM from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("__vinland"));

let index = createFromFetch(fetch("/__vinland/index"));

const socket = new window.WebSocket(`ws://localhost:3500/__vinland/hmr`);

function canApplyUpdates() {
  return module.hot.status() === "idle";
}

socket.onmessage = ({ data }) => {
  if (!module && !module.hot) {
    console.warn("may be webpack.HotModuleReplacementPlugin get some wrong.");
    return;
  }
  switch (data) {
    case "file-updated":
      {
        if (canApplyUpdates()) {
          module.hot
            .check(false)
            .then((updatedModules) => {
              if (!updatedModules) return null;
              module.hot.accept(updatedModules);
              return module.hot.apply();
            })
            .then(
              (updatedModules) => {
                console.log("update applied");
              },
              (err) => {
                console.log(err);
              }
            );
        }
      }
      break;
  }
};

const App = () => {
  const app = use(index);
  console.log("recs1");
  const ping = () => {
    console.log("ping");
    socket.send("ping");
  };
  const [count, setCount] = useState(0);
  return (
    <>
      {app}
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>inc</button>
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
