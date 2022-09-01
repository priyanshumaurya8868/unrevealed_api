const http = require("http");
const port = process.env.PORT || 2022;
const app = require("./app");
const mongoose = require('mongoose');
const { markAsUntransferable } = require("worker_threads");
const server = http.createServer(app);
const Message = require('./models/message')
const Conversation = require('./models/conversation')
mongoose
  .connect(process.env.mongodb_URL)
  .then(() => {
    server.listen(port, () => {
      console.log(`listening portNo. ${port}`);
    });

    const io = require("./socket").init(server);
   
  let onlineUsers = [];

  const getUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId);
  };

  const addUser = (userId, socketId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId });
  };
  
  const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  };
  
  io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");
  
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", onlineUsers);
    });

     //send and get message
  socket.on("sendMessage",async({ senderId, receiverId, text, conversationId }) => {
    const user = getUser(receiverId);
    
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });

    const msg = new Message({
      senderId : senderId,
      conversationId : conversationId,
      text : text
    })

    await msg.save()
  });
  
    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", onlineUsers);
    });
  });
  
  })
  .catch((err) => console.log(err));

module.exports = server;
