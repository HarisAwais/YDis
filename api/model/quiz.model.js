
const Quiz = require("../schema/quiz.schema");
const mongoose = require("mongoose");

const savedQuiz = async (assignmentData) => {
  try {
    const quiz = new Quiz(assignmentData);

    const savedQuiz = await quiz.save();

    if (savedQuiz) {
      return {
        status: "SUCCESS",
        data: savedQuiz,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "OOPS!Something went wrong",
      error: error.message,
    };
  }
};

const updateQuiz = async (assignmentId, updateData) => {
  try {
    const updatedAssignment = await Quiz.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true }
    );

    if (updatedAssignment) {
      return {
        status: "SUCCESS",
        data: updatedAssignment,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const deleteQuiz = async (_id, user) => {
  try {
    const quiz = await Quiz.findById({ _id });
    if (!quiz) {
      return {
        status: "NOT_FOUND",
        message: "Quiz not found",
      };
    }
    if (String(quiz.createdBy) !== String(user)) {
      return {
        status: "FORBIDDEN",
        message: "Access denied",
      };
    }

    quiz.isDeleted = true
    // Delete the assignment
    const result = await quiz.save();
    if (result) {
      return {
        status: "SUCCESS",
      };
    } else {
      return {
        status: "FAILED",
        message: "OOPS! Something went wrong",
      };
    }
  } catch (error) {
    return {
      status: "OOPS!Something went wrong",
      error: error.message,
    };
  }
};

const quizById = async (_id) => {
  try {
    const quiz = await Quiz.findById(_id);

    if (quiz) {
      return {
        status: "SUCCESS",
        data: quiz,
      };
    } else {
      return {
        status: "NOT_FOUND",
        message: "Quiz not found",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const subscribeCourse = async (courseId, studentId) => {
  try {
    const subscription = await Subscription.findOne({
      _courseId: courseId,
      _studentId: studentId,
      status: "active",
    });

    if (subscription) {
      return {
        status: "SUCCESS",
        subscription: subscription,
      };
    } else {
      return {
        status: "NOT_FOUND",
        message: "You are no Eligibele for this test",
      };
    }
  } catch (error) {
    return res.status(500).send({
      success: "FAILED",
      message: "SORRY! Something Went Wrong",
    });
  }
};

const calculateScore = (questions, submittedAnswers) => {
  let totalScore = 0;
  const questionScores = [];

  questions.forEach((question, index) => {
    const correctOption = question.correctOption;
    const submittedOption = submittedAnswers[index].selectedOption;

    if (submittedOption !== undefined && submittedOption === correctOption) {
      totalScore++;
    }

    questionScores.push({
      questionText: question.questionText,
      selectedOption: submittedOption,
      correctOption: correctOption,
      isCorrect:
        submittedOption !== undefined && submittedOption === correctOption,
    });
  });

  return {
    totalScore: totalScore,
    questionScores: questionScores,
  };
};

const submitQuizToDB = async (studentId, quizId, submittedAnswers, score) => {
  try {
    const quizHistoryEntry = {
      quizId: quizId,
      studentId,
      answers: submittedAnswers.map((answer) => ({
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
      })),
      score: score,
      submittedAt: new Date(),
    };

    const updateQuery = {
      $push: { studentAnswers: quizHistoryEntry },
      $set: { updated: true },
    };
    const updateResult = await Quiz.updateOne({ _id: quizId }, updateQuery);

    if (updateResult) {
      return {
        status: "SUCCESS",
        message: "Quiz saved successfully",
      };
    } else {
      return {
        status: "FAILED",
        message: "Failed to update student data",
      };
    }
  } catch (error) {
    return {
      status: "FAILED",
      error: error.message,
    };
  }
};

const getStudentsWhoTookQuiz = async (quizId) => {
  try {
    const studentsTookQuiz = await Quiz.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(quizId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "studentAnswers.studentId",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: {
          path: "$studentInfo",
        },
      },
      {
        $project: {
          studentId: "$studentInfo._id",
          firstName: "$studentInfo.firstName",
          lastName: "$studentInfo.lastName",
          answers: "$studentAnswers.answers",
          score: "$studentAnswers.score",
          submittedAt: "$studentAnswers.submittedAt",
        },
      },
    ]);

    return studentsTookQuiz;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getCertificate = async (studentId) => {
  try {
    const quizData = await Quiz.aggregate([
      {
        $match: {
          "studentAnswers.studentId": new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "studentAnswers.studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $unwind: "$teacher",
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          studentName: {
            $concat: ["$student.firstName", " ", "$student.lastName"],
          },
          teacherName: {
            $concat: ["$teacher.firstName", " ", "$teacher.lastName"],
          },
          courseName: "$course.name",
          studentId: "$student._id",
          score: "$studentAnswers.score",
          questions: "$questions",
        },
      },
    ]);

    if (quizData && quizData.length > 0) {
      return {
        status: "SUCCESS",
        data: quizData[0], // Assuming you want the first quiz found (you can modify this logic)
      };
    } else {
      return {
        status: "FAILED",
        error: "No quiz found for the given studentId",
      };
    }
  } catch (error) {
    return {
      status: "OOPS! Something went wrong",
      error: error.message,
    };
  }
};

module.exports = {
  savedQuiz,
  updateQuiz,
  deleteQuiz,
  quizById,
  subscribeCourse,
  calculateScore,
  submitQuizToDB,
  getStudentsWhoTookQuiz,
  getCertificate,
};
