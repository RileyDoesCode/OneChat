const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let messages = [];
const dataFile = path.join(__dirname, "messages.json");

if (fs.existsSync(dataFile)) {
  messages = JSON.parse(fs.readFileSync(dataFile));
}

io.on("connection", (socket) => {

  socket.emit("loadMessages", messages);

  socket.on("chatMessage", (data) => {
    const message = {
      nickname: data.nickname,
      text: data.text,
      time: new Date().toLocaleTimeString()
    };

    messages.push(message);

    fs.writeFileSync(dataFile, JSON.stringify(messages));

    io.emit("chatMessage", message);
  });

  socket.on("typing", (nickname) => {
    socket.broadcast.emit("typing", nickname);
  });

});

server.listen(PORT, () => {
  console.log("Server running...");
});
