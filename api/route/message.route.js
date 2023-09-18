const express = require("express");
const { receiveMessages, sendMessage } = require("../controller/message.controller");
const {authentication} = require("../middleware/authentication.middleware")
const messageRouter = express.Router();
messageRouter.post("/", authentication,sendMessage);

messageRouter.get("/receive/:receiverId", authentication,receiveMessages);

module.exports = messageRouter;
