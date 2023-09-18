const MessageModel = require("../model/message.model");
const { io } = require("../../socket");
const { getConnectedUsers } = require("../../socket");


// Function to send a message
const sendMessage = async (req, res) => {
  try {
    let { receiverId, message } = req.body;
    const senderId = req.decodedToken._id;

    const result = await MessageModel.saveMessage(senderId, receiverId, message);

    if (result.status === "SUCCESS") {
      const receiver = getConnectedUsers().find((user) => user.userId === receiverId);
      console.log(receiver)

      if (receiver) {
        io.to(receiver.socketId).emit("receive-message", {
          senderId,
          receiverId,
          message,
        });
      }

      res.status(201).send({
        message: "Message sent successfully",
        data: result.data,
      });
    } else {
      res.status(500).send({ message: "Failed to send message" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OOPS! Something went wrong" });
  }
};

// Function to receive messages
const receiveMessages = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const senderId = req.decodedToken._id;

    const result = await MessageModel.fetchMessages(senderId, receiverId);

    if (result) {
      // Assuming you have connectedUsers as an array of connected users
      const receiver = getConnectedUsers().find((user) => user.userId === receiverId);

      if (receiver) {
        // Emit the messages to the receiver using Socket.IO
        io.to(receiver.socketId).emit("receive-messages", result.data);

        res.status(200).json({ message: "Messages sent to receiver", data: result.data });
      } else {
        res.status(404).json({ message: "Receiver not found" });
      }
    } else {
      res.status(500).json({ message: "Failed to fetch messages", error: result.error });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Oops! Something went wrong" });
  }
};

module.exports = { sendMessage, receiveMessages };
