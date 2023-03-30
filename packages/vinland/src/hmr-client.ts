if (typeof window !== undefined) {
  const socket = new window.WebSocket(`ws://localhost:3500/__vinland/hmr`);

  socket.onmessage = ({ data, type }) => {
    console.log(type);
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
}
