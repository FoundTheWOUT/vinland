const AddTodo = () => {
  const handleClick = () => {
    const input = document.getElementById("input");
    fetch("http://127.0.0.1:3500/todo", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        label: input.value,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          console.log("success");
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        console.log(error);
      });
    input.value = "";
  };

  return (
    <div>
      <input id="input" type="text" />
      <button onClick={handleClick}>Add</button>
    </div>
  );
};

export default AddTodo;
