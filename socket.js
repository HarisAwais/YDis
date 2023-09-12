const { Server } = require("socket.io");

let connectedUsers = [];

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

    io.on("connection", (socket) => {
      // add new User
      socket.on("new-user-add", (newUserId) => {
        // if user is not added previously
        if (!connectedUsers.some((user) => user.userId === newUserId)) {
          connectedUsers.push({ userId: newUserId, socketId: socket.id });
          console.log("New User Connected", connectedUsers);
        }
        // send all active users to new user
        io.emit("get-users", connectedUsers);
      });

      socket.on("disconnect", () => {
        // remove user from active users
        connectedUsers = connectedUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", connectedUsers);
        // send all active users to all users
        io.emit("get-users", connectedUsers);
      });

      // send message to a specific user
      socket.on("send-message", (data) => {
        const { receiverId } = data;
        const user = connectedUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to:", receiverId);
        console.log("Data:", data);
        if (user) {
          io.to(user.socketId).emit("receive-message", data); // Typo corrected here
        }
      });
    });
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
}

module.exports = {
  connect: Socket.init,
  connection: Socket.getConnection,
  connectedUsers, // Export the connectedUsers array
};
