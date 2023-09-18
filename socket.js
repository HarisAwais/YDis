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
      // Handle new user connection
      socket.on("new-user-add", (newUserId) => {
        if (!connectedUsers.some((user) => user.userId === newUserId)) {
          connectedUsers.push({ userId: newUserId, socketId: socket.id });
          console.log("New User Connected", connectedUsers);
        }
        io.emit("get-users", connectedUsers);
      });

      // Handle user disconnection
      socket.on("disconnect", () => {
        connectedUsers = connectedUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", connectedUsers);
        io.emit("get-users", connectedUsers);
      });

      // Handle sending messages
      socket.on("send-message", (data) => {
        const { receiverId } = data;
        const user = connectedUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to:", receiverId);
        console.log("Data:", data);
        if (user) {
          io.to(user.socketId).emit("receive-message", data);
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

  // Export connectedUsers separately
  static getConnectedUsers() {
    console.log(connectedUsers)
    return connectedUsers;
  }
}

module.exports = {
  connect: Socket.init,
  connection: Socket.getConnection,
  getConnectedUsers: Socket.getConnectedUsers, // Export connectedUsers separately
};
