const express = require("express");
const { generateId } = require("../middleware/generateId");
const { authentication } = require("../middleware/authentication.middleware");
const { isTeacher } = require("../middleware/authorization.middleware");
const formidable = require("express-formidable");
const {
  createQuiz,
  updateQuiz,
  getAllQuizzesTeacher,
  deleteQuiz,
  submitQuiz,
  getStudentsTookQuiz,
} = require("../controller/quiz.controller");
const quizRouter = express.Router();

quizRouter.post("/create-quiz", authentication, isTeacher, createQuiz),
  quizRouter.patch(
    "/update-quiz/:quizId",
    authentication,
    isTeacher,
    updateQuiz
  ),
  quizRouter.get(
    "/getAllQuiz",
    authentication,
    isTeacher,
    getAllQuizzesTeacher
  ),
  quizRouter.delete(
    "delete-quiz/:quizId",
    authentication,
    isTeacher,
    deleteQuiz
  );
quizRouter.patch("/submit-quiz/:quizId", authentication, submitQuiz);
quizRouter.get("/get-quizez/:quizId", authentication, getStudentsTookQuiz);

module.exports = quizRouter;
