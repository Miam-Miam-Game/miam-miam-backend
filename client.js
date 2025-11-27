const { io } = require("socket.io-client");

const socket = io("http://localhost:3000"); // URL de ton serveur NestJS

const user = "Alice";
const user2 = "Bob";
const room = "room1";

// Rejoindre la room
socket.emit("connectionRoom", { user, room });
socket.emit("connectionRoom", { user2, room });

// Écouter les messages
socket.on("events", (data) => {
  console.log("Message reçu :", data);
});

// Envoyer un message après 2 secondes
setTimeout(() => {
  socket.emit("events", { user, room, message: "Bonjour tout le monde !" });
  socket.emit("events", { user2, room, message: "Bonjour tout le monde ! 2" });
}, 2000);
