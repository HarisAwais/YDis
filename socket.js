const connectedUsers = [];
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Chat = require("./api/schema/chat.schema");

let connection = null;

class Socket {
  constructor() {
    this.socket = null;
  }

  connect(server) {
    const io = new Server(server, {
      cors: {
        origin: ["*"],
      },
      allowEIO3: true,
    });

    io.use(async (socket, next) => {
      try {
        const id = socket.handshake.query.id;
        socket.userId = id;
        const socketObj = {};

        if (connectedUsers.length <= 0) {
          socketObj[`${id}`] = [socket];
          connectedUsers.push(socketObj);
        }

        next();
      } catch (err) {
        console.error("Socket connection error:", err);
      }
    });

    io.on("connection", async (socket) => {
      console.log("*** connected socket & user ***", {
        socketId: socket.id,
        userId: socket.userId,
      });

      // Retrieve chat messages for the user when they connect
      try {
        const userId = socket.userId;

        // Fetch chat messages from MongoDB
        const chat = await Chat.findOne({
          participants: userId,
        }).populate({
          path: "messages.sender messages.receiver",
          select: "firstName lastName", 
        });

        if (chat) {
          // Send the chat history to the user
          socket.emit("chatHistory", chat.messages);
        }
      } catch (error) {
        console.error("Chat history retrieval error:", error);
      }

      socket.on("chat", async (data) => {
        try {
          const { senderId, receiverId, text } = data;

          // Create a new chat or find an existing chat with these participants
          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, receiverId],
              messages: [],
            });
          }

          // Add the new message to the chat
          chat.messages.push({
            text,
            sender: senderId,
            receiver: receiverId,
          });

          await chat.save();

          // Emit the message to the sender and receiver
          const senderSocket = this.getSocketByUserId(senderId);
          const receiverSocket = this.getSocketByUserId(receiverId);

          if (senderSocket) {
            senderSocket.emit("messageSent", chat.messages);
          }

          if (receiverSocket) {
            receiverSocket.emit("messageReceived", chat.messages);
          }
        } catch (error) {
          console.error("Chat message error:", error);
        }
      });
      socket.on("typing", (data) => {
        const receiverSocket = this.getSocketByUserId(data.receiverId);
        if (receiverSocket) {
          receiverSocket.emit("userTyping", { userId: data.senderId });
        }
      });

      socket.on("stoppedTyping", (data) => {
        const receiverSocket = this.getSocketByUserId(data.receiverId);
        if (receiverSocket) {
          receiverSocket.emit("userStoppedTyping", { userId: data.senderId });
        }
      });

      this.socket = socket;
    });
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  static init(server) {
    if (!connection) {
      connection = new Socket();
      connection.connect(server);
    }
  }

  static getConnection() {
    if (connection) {
      return connection;
    }
  }

  getSocketByUserId(userId) {
    const userSocket = connectedUsers.find((user) => user[userId]);
    return userSocket ? userSocket[userId][0] : null;
  }
}

module.exports = {
  connect: Socket.init,
  connection: Socket.getConnection,
  connectedUsers,
};
