require("dotenv").config();
const express = require("express");
const path = require("path")
const http = require("http");
const Socket = require("./socket");
const connectDB = require("./config/connectDB");

const userRouter = require("./api/route/user.route");
const courseRouter = require("./api/route/course.route");
const subscriptionRouter = require("./api/route/subscription.route");
const quizRouter = require("./api/route/quiz.route");
const twilioRouter = require("./api/route/twilio.route");
const socket = require("./socket");


const app = express();
// const server = http.createServer(app);

app.use(express.json());

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});


app.use("/video", twilioRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/quiz", quizRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 5000;
connectDB();

 server=app.listen(PORT, (req, res) => {
  console.log("server is running");
});

socket.connect(server)
