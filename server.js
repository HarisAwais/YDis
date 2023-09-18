require("dotenv").config();
const express = require("express");
const path = require("path")
const connectDB = require("./config/connectDB");
const userRouter = require("./api/route/user.route");
const courseRouter = require("./api/route/course.route");
const subscriptionRouter = require("./api/route/subscription.route");
const quizRouter = require("./api/route/quiz.route");
const socket = require("./socket");
const messageRouter = require("./api/route/message.route");
const twilioRouter = require("./api/route/twilio.route");

const app = express();


app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.use("/video", twilioRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/message",messageRouter)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
connectDB();

const server =app.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
  socket.connect(server);

});


//cancel and teacher subscription
