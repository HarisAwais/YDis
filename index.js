require("dotenv").config();
const { io } = require("./socket");
const { server } = require("./server");

const PORT = process.env.PORT || 5000;

server.listen(PORT, (req, res) => {
  console.log("server is running");
});
