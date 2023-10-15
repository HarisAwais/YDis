const express = require("express");

const { authentication } = require("../middleware/authentication.middleware");

const { isTeacher } = require("../middleware/authorization.middleware");

const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  studentsWhoTookQuiz,
  getCertificate,
  listQuiz,
  shareQuizLink,
  
} = require("../controller/quiz.controller");
const { validateInput } = require("../middleware/validateInput.middleware");

const {
  teacherQuestion,
  studentAnswers,
  quizIDValidate,
} = require("../validators/quiz.validator");

const quizRouter = express.Router();

//Teacher create Quiz
quizRouter.post(
  "/create-quiz",
  validateInput(teacherQuestion, "BODY"),
  authentication,
  isTeacher,
  createQuiz
),

//list quiz
quizRouter.get("/list-quiz",
authentication,
listQuiz
)

//share quiz
quizRouter.get("/share/:quizId",
authentication,
shareQuizLink
)

  //Teacher update Quiz
  quizRouter.patch(
    "/update-quiz/:quizId",
    validateInput(teacherQuestion, "BODY"),
    authentication,
    updateQuiz
  ),
  //Teacher delete Quiz
  quizRouter.delete(
    "/delete-quiz/:quizId",
    validateInput(quizIDValidate, "PARAMS"),
    authentication,
    deleteQuiz
  );

//Student submit Quiz
quizRouter.put(
  "/submit-quiz/:quizId",
  validateInput(quizIDValidate, "PARAMS"),
  validateInput(studentAnswers, "BODY"),
  authentication,
  submitQuiz
);

//teacher get students who took exam
quizRouter.get(
  "/get-quizez/:quizId",
  authentication,
  isTeacher,
  studentsWhoTookQuiz
);

//student get certificate
quizRouter.get("/certificate",authentication,getCertificate)



module.exports = quizRouter;
