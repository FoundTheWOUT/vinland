import React, { Suspense, use } from "react";
import ReactDOM from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("__vinland"));

let index = createFromFetch(fetch("/__vinland/index"));

const App = () => {
  const app = use(index);
  return <>{app}</>;
};

root.render(
  <ErrorBoundary>
    <Suspense>
      <App />
    </Suspense>
  </ErrorBoundary>
);
