import React, { Suspense, use } from "react";
import ReactDOM from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("__vinland"));

let index = createFromFetch(fetch("/__vinland/index"));

const socket = new window.WebSocket(`ws://localhost:3500/__vinland/hmr`);

socket.onmessage = ({ data }) => {
  switch (data) {
    case "file-updated":
      {
        if (module && module.hot) {
          module.hot
            .check(false)
            .then((updatedModules) => {
              if (!updatedModules) return null;
              return module.hot.apply();
            })
            .then(
              (updatedModules) => {
                console.log(updatedModules);
              },
              (err) => {
                console.log(err);
                // handleApplyUpdates(err, null);
              }
            );
        }
      }
      break;
  }
};

const App = () => {
  // const app = use(index);
  console.log("recs112");
  const ping = () => {
    socket.send("ping");
  };
  return (
    <>
      {/* {app} */}
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
