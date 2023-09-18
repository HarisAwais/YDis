const Quiz = require("../schema/quiz.schema");
const User = require("../schema/user.schema");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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


const deleteQuiz = async (_id,user) => {
  try {
    const quiz = await Quiz.findById(_id);
    // console.log(quiz)

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

    // Delete the assignment
    await quiz.deleteOne({ _id });

    return {
      status: "SUCCESS",
      message: "Quiz deleted successfully",
    };
  } catch (error) {
    return {
      status: "OOPS!Something went wrong",
      error: error.message,
    };
  }
};


const quizById = async (quizId) => {
  try {
    const quiz = await Quiz.findById({ _id: quizId });


    if (!quiz) {
      return {
        status: "NOT_FOUND",
        message: "Quiz not found",
      };
    }

    return {
      status: "SUCCESS",
      data: quiz,
    };
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
    const studentsTookQuiz = await Quiz.aggregate( [
      {
        $match: {
          _id: new ObjectId(quizId)
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'studentAnswers.studentId',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: {
          path: '$studentInfo',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          studentId: '$studentInfo._id',
          firstName: '$studentInfo.firstName',
          lastName: '$studentInfo.lastName',
          answers: '$studentAnswers.answers',
          score: '$studentAnswers.score',
          submittedAt: '$studentAnswers.submittedAt'
        }
      }
    ]);


    return studentsTookQuiz;
  } catch (error) {
    console.error(error);
    return null;
  }
};


const getCertification = async(quizId)=>{
  try {
    const quizData = await Quiz.aggregate([
      {
        $match: {
          _id: ObjectId(quizId),
        },
      },
      {
        $lookup: {
          from: "User",
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
          from: "Course", 
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
            $concat: ["$student.firstName", " ", "$student.secondName"],
          },
          teacherName: {
            $concat: ["$teacher.firstName", " ", "$teacher.secondName"],
          },
          courseName: "$course.name",
        },
      },
  
      
    ]);
  
    if (quizData && quizData.length > 0) {
      const result = {
        status: "SUCCESS",
        data: {
          studentName: quizData[0].studentName,
          teacherName: quizData[0].teacherName,
          courseName: quizData[0].courseName,
        },
      };
      return result;
    } else {
      return { status: "FAILED" };
    }
  
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }

}

module.exports = {
  savedQuiz,
  updateQuiz,
  deleteQuiz,
  quizById,
  subscribeCourse,
  calculateScore,
  submitQuizToDB,
  getStudentsWhoTookQuiz,
  getCertification
};
