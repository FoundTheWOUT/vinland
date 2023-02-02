import React, { Suspense, use } from "react";
import { createFromFetch } from "react-server-dom-webpack/client";

const res = createFromFetch(fetch("/react"));

const HelloRSC = () => {
  const children = use(res);
  return <>{children}</>;
};

const withSuspense = () => (
  <Suspense fallback={<div>loading...</div>}>
    <HelloRSC />
  </Suspense>
);

export default withSuspense;
