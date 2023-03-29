import React, { Suspense } from "react";
// import reactLogo from "./assets/react.svg";
// import "./App.css";
// import ErrorBoundary from "./ErrorBoundary.js";
// import { createFromFetch } from "react-server-dom-webpack/client";
import AddTodo from "./components/AddTodo";
// import TodoList from "./Todo.server";
import Comp from "./components/Comp";

// let todo = createFromFetch(fetch("/todo"));

function App() {
  // const [_, startTransition] = useTransition();
  // const todoComp = use(todo);

  return (
    <div className="App">
      <Comp />
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          {/* <img src={reactLogo} className="logo react" alt="React logo" /> */}
        </a>
      </div>
      <h1>Vite + React2</h1>
      <h2>hhhhhhhhhhhhc</h2>
      <div>
        <div>todo!</div>
        <AddTodo />
        {/* <TodoList /> */}
      </div>
    </div>
  );
}

const Wrapper = () => {
  return (
    <Suspense>
      <App />
    </Suspense>
  );
};

export default Wrapper;
