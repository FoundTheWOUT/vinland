import React from "react";

const TODO = async () => {
  const todoList = await fetch("http://localhost:3000/todos").then((res) =>
    res.json()
  );
  return todoList.map((item, idx) => (
    <div key={idx}>
      <span>{item.label}</span>
    </div>
  ));
};

export default TODO;
