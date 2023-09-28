const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/connectDB");

const userRouter = require("./api/route/user.route");
const courseRouter = require("./api/route/course.route");
const subscriptionRouter = require("./api/route/subscription.route");
const quizRouter = require("./api/route/quiz.route");
const twilioRouter = require("./api/route/twilio.route");

const app = express();

const server = require("http").createServer(app);
console.log(server && "server is created");
// const io = require("socket.io")(server);

app.use(express.json());

app.use(cors());
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

app.get("/card-payment", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/card.html"));
});

app.get("/create-subscription", (req, res) => {
  res.sendFile(path.join(__dirname, "public/subcription.html"));
});

/*===================USER ENDPOINT=====================*/

app.use("/api/v1/user", userRouter);
/*===================COURSE ENDPOINT=====================*/

app.use("/api/v1/course", courseRouter);
/*===================SUBSCRIPTION ENDPOINT=====================*/

app.use("/api/v1/subscription", subscriptionRouter);
/*=================== QUIZ ENDPOINT =====================*/

app.use("/api/v1/quiz", quizRouter);

/*===================VIDEO CALL ENDPOINT =====================*/
app.use("/video", twilioRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

connectDB();

module.exports = { app, server };


