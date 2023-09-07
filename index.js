const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();

const HarperSaveMessage = require("./services/harper-save-message.js");
const harperGetMessages = require("./services/harper-get-messages.js");

const leaveRoom = require("./utils/leave-room.js");
const { Server } = require("socket.io");
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world");
});
const server = app.listen(8080, () => {
  console.log("server connected on port 8080");
});

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

const CHAT_BOT = "ChatBot";
let chatRoom = "";
let allUsers = [];

io.on("connection", (socket) => {
  socket.on("join_room", async (data) => {
    const { userName, room } = data;
    socket.join(room);
    let __createdtime__ = Date.now();
    socket.to(room).emit("recieve_message", {
      message: `${userName} has joined the chat room`,
      userName: CHAT_BOT,
      __createdtime__,
    });
    socket.emit("recieve_message", {
      message: `Welcome ${userName}`,
      userName: CHAT_BOT,
      __createdtime__,
    });
    chatRoom = room;
    allUsers.push({ id: socket.id, userName, room });
    const chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);

    const last100msg = await harperGetMessages(room);
    socket.emit("last_100_messages", last100msg);
  });

  socket.on("leave_room", (data) => {
    const { userName, room } = data;
    socket.leave(room);
    const __createdtime__ = Date.now();
    // Remove user from memory
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit("chatroom_users", allUsers);
    socket.to(room).emit("recieve_message", {
      userName: CHAT_BOT,
      message: `${userName} has left the chat`,
      __createdtime__,
    });
  });

  socket.on("send_message", async (data) => {
    const { userName, room, message, __createdtime__ } = data;
    io.in(room).emit("recieve_message", data);
    const response = await HarperSaveMessage(
      userName,
      room,
      message,
      __createdtime__
    );
  });

  socket.on("disconnect", () => {
    const user = allUsers.find((user) => user.id == socket.id);
    if (user?.username) {
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit("chatroom_users", allUsers);
      socket.to(chatRoom).emit("receive_message", {
        message: `${user.username} has disconnected from the chat.`,
      });
    }
  });
});

module.exports = app;
