const QuizModel = require("../model/quiz.model");
const Quiz = require("../schema/quiz.schema");
const User = require("../schema/user.schema");
const Course = require("../schema/course.schema");
const UserModel = require("../model/user.model");
const {
  generateCertificatePdf,
  calculateScorePercentage,
} = require("../helper/generatePdf.helper");

const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questions, startTime, endTime } = req.body;
    const teacherId = req.decodedToken._id;
    const newQuiz = {
      title,
      courseId,
      questions,
      createdBy: teacherId,
      startTime,
      endTime,
    };

    // Save the quiz to the database
    const createdQuiz = await QuizModel.savedQuiz(newQuiz);

    res.status(201).json({
      message: "Quiz created successfully.",
      quiz: createdQuiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create quiz." });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const updateData = req.body;

    const quiz = await QuizModel.quizById(quizId);

    if (String(quiz?.data?.createdBy) !== String(req.decodedToken._id)) {
      return res.status(403).json({
        error: "Access denied. You are not the creator of this quiz.",
      });
    }

    const updateResult = await QuizModel.updateQuiz(quizId, updateData);

    if (updateResult.status === "SUCCESS") {
      res.status(200).json({ data: updateResult.data });
    } else if (updateResult.status === "FAILED") {
      res.status(404).json({ error: "Quiz not found" });
    } else {
      res.status(500).json({ error: updateResult.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const teacherQuizez = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;

    const getAllQuizzesResult = await QuizModel.getAllQuiz(teacherId);

    if (getAllQuizzesResult.status === "SUCCESS") {
      res.status(200).json(getAllQuizzesResult.data);
    } else if (getAllQuizzesResult.status === "NOT_FOUND") {
      res.status(404).json({ message: getAllQuizzesResult.message });
    } else {
      res.status(500).json({ error: getAllQuizzesResult.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// teacher will delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const user = req.decodedToken._id;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const quizId = req.params.quizId;
    const deletedQuiz = await QuizModel.deleteQuiz(quizId);
    res.status(200).json(deletedQuiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const studentId = req.decodedToken._id;

    const quiz = await QuizModel.quizById(quizId);

    const score = QuizModel.calculateScore(quiz.data?.questions, answers);

    const studentSubmission = {
      studentId,
      answers: answers.map((selectedOption, questionIndex) => ({
        questionIndex,
        selectedOption: selectedOption.selectedOption,
      })),
      score: score.totalScore,
      submittedAt: new Date(),
    };

    const submissionResult = await QuizModel.submitQuizToDB(
      studentId,
      quizId,
      studentSubmission.answers,
      studentSubmission.score
    );

    if (submissionResult.status == "SUCCESS") {
      return res.status(200).send({
        message: "Quiz submitted successfully",
        score: studentSubmission.score,
        submission: studentSubmission,
      });
    } else {
      return res.status(500).send({
        message: "Failed to submit quiz",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

//teacher get student who took exam

const getStudentsTookQuiz = async (req, res) => {
  // console.log(req.decodedToken._id)
  try {
    const quizId = req.params.quizId;
    // Fetch quiz details
    const quizResponse = await QuizModel.quizById(quizId);

    if (quizResponse.status === "NOT_FOUND") {
      return res.status(404).json({
        status: "FAILED",
        message: "Quiz not found",
      });
    }

    if (quizResponse.status === "INTERNAL_SERVER_ERROR") {
      return res.status(500).json({
        status: "FAILED",
        message: "SORRY! Something Went Wrong",
      });
    }

    const quiz = quizResponse.quiz;

    // Check if the authenticated teacher is the creator of the quiz
    if (quiz.createdBy.toString() !== req.decodedToken._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Get students who took the quiz using the separate function
    const studentsTookQuiz = await QuizModel.getStudentsWhoTookQuiz(quizId);

    if (studentsTookQuiz === null) {
      return res.status(404).json({
        status: "FAILED",
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      status: "SUCCESS",
      data: studentsTookQuiz,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: "SORRY! Something Went Wrong",
    });
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
  teacherQuizez,
  deleteQuiz,
  getStudentsTookQuiz,
  submitQuiz,
};
