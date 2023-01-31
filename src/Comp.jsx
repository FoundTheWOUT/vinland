import React from "react";
import dayjs from 'dayjs'

export default function Comp() {
  return (
    <div>
      <h3>Dark1</h3>
      <div>Now {dayjs().format('HH:mm:ss')}!</div>
    </div>
  );
}
