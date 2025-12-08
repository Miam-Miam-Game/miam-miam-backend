const { io } = require("socket.io-client");

const socket = io("http://localhost:4500");

socket.emit("join", { username: "Player1" });

socket.on("waitingRoom", data => {
  console.log("WAITING ROOM:", data);
});

socket.on("gameStart", data => {
  console.log("GAME START:", data);
});

socket.on("timer", time => {
  console.log("TIME LEFT:", time);
});

socket.on("gameEnd", data => {
  console.log("GAME END:", data);
});
