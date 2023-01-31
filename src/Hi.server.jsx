import React, { Suspense, use } from "react";
import { createFromFetch } from "react-server-dom-webpack/client";

const HelloRSC = () => {
  const res = createFromFetch(fetch("/react"));
  const children = use(res);

  return <>{children}</>;
};

const withSuspense = () => (
  <Suspense fallback={<div>loading...</div>}>
    <HelloRSC />
  </Suspense>
);

export default withSuspense;
