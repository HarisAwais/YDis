require("dotenv").config();
const express = require("express");
const connectDB = require("./config/connectDB");
const userRouter = require("./api/route/user.route");
const courseRouter = require("./api/route/course.route");
const subscriptionRouter = require("./api/route/subscription.route");
const quizRouter = require("./api/route/quiz.route");
const socket = require("./socket");
const chatRouter = require("./api/route/chat.route");
const messageRouter = require("./api/route/message.route");
const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("YOUR DIVING INSTRUCTOR HERE"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/chat",chatRouter)
app.use("/api/v1/message",messageRouter)



const PORT = process.env.PORT || 5000;
connectDB();
const server =app.listen(PORT, () => {
  console.log("SERVER IS RUNNING");
});

socket.connect(server);