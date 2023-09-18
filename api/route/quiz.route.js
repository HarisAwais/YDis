const express = require("express");

const { authentication } = require("../middleware/authentication.middleware");

const { isTeacher } = require("../middleware/authorization.middleware");

const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  studentsWhoTookQuiz,
} = require("../controller/quiz.controller");

const quizRouter = express.Router();

//Teacher create Quiz
quizRouter.post("/create-quiz", authentication, isTeacher, createQuiz),

//Teacher update Quiz
  quizRouter.patch(
    "/update-quiz/:quizId",
    authentication,
    isTeacher,
    updateQuiz
  ),

  //Teacher delete Quiz
  quizRouter.delete(
    "/delete-quiz/:quizId",
    authentication,
    isTeacher,
    deleteQuiz
  );

  //Student submit Quiz
quizRouter.put("/submit-quiz/:quizId", authentication, submitQuiz);

//teacher get students who took exam
quizRouter.get("/get-quizez/:quizId", authentication,isTeacher, studentsWhoTookQuiz);

module.exports = quizRouter;


