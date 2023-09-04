const QuizModel = require("../model/quiz.model");
const Quiz = require("../schema/quiz.schema");
const User = require("../schema/user.schema")
const Course = require("../schema/course.schema")
const UserModel = require("../model/user.model");
const { generateCertificatePdf, calculateScorePercentage } = require("../helper/generatePdf.helper");

const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questions, startTime, endTime } = req.body;
    const teacherId = req.decodedToken._id; // Assuming you're using JWT or similar for authentication

    // Create the quiz object
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
    // console.log(quiz)

    //  console.log(String(quiz.createdBy) !== String(req.decodedToken._id))
    // return
    if (String(quiz.quiz?.createdBy) !== String(req.decodedToken._id)) {
      return res.status(403).json({
        error: "Access denied. You are not the creator of this quiz.",
      });
    }
    // return

    const updateResult = await QuizModel.updateQuiz(quizId, updateData);

    if (updateResult.status === "SUCCESS") {
      res.status(200).json(updateResult.data);
    } else if (updateResult.status === "FAILED") {
      res.status(404).json({ error: "Quiz not found" });
    } else {
      res.status(500).json({ error: updateResult.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// quizz which teacher will create
const getAllQuizzesTeacher = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;

    const getAllQuizzesResult = await QuizModel.getAllQuiz(teacherId);
    // console.log(getAllQuizzesResult)
    // return

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
    // Validate token and check permission
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

//student submit exam
// const submitQuiz = async (req, res) => {
//   try {
//     const quizId = req.params.quizId;
//     const { answers } = req.body;
//     const studentId = req.decodedToken._id;

//     const quiz = await Quiz.findById(quizId);

//     if (!quiz) {
//       return res.status(404).send({
//         message: "QUIZ NOT FOUND",
//       });
//     }

//     const score = QuizModel.calculateScore(quiz.questions, answers);

//     const studentSubmission = {
//       studentId,
//       answers: answers.map((selectedOption, questionIndex) => ({
//         questionIndex,
//         selectedOption: selectedOption.selectedOption,
//       })),
//       score: score.totalScore,
//       submittedAt: new Date(),
//     };
   
//     const submissionResult = await QuizModel.submitQuizToDB(
//       studentId,
//       quizId,
//       studentSubmission.answers,
//       studentSubmission.score
//     );



//     if (submissionResult.status === "SUCCESS") {
//       return res.status(200).send({
//         message: "Quiz submitted successfully",
//         score: studentSubmission.score,
//         submission: studentSubmission,
//       });
//     } else {
//       return res.status(500).send({
//         message: "Failed to submit quiz",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: "Internal server error",
//     });
//   }
// };
const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { answers } = req.body;
    const studentId = req.decodedToken._id;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).send({
        message: "QUIZ NOT FOUND",
      });
    }

    const score = QuizModel.calculateScore(quiz.questions, answers);

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

    if (submissionResult.status === "SUCCESS") {

      

      // Check if the student's score meets the criteria to generate a certificate
        const student = await User.findById(studentId).lean().exec();
        const teacher = await User.findById(quiz.createdBy).lean().exec();
        const course = await Course.findById(quiz.courseId).lean().exec();

        if (student && teacher && course) {
          const studentName = `${student.firstName} ${student.secondName}`;
          const teacherName = `${teacher.firstName} ${teacher.secondName}`;
          const courseName = course.name;
          const completionDate = new Date().toDateString(); // You can modify this as needed
          // console.log(completionDate)
          // return

          // Generate the certificate PDF and save it with a filename
          const pdfFilename = `${studentName}_Certificate.pdf`;
          // console.log(pdfFilename)
          // return

          await generateCertificatePdf(
            studentName,
            teacherName,
            courseName,
            completionDate,
            pdfFilename
          );

          // Here you can send the certificate PDF via email to the student or take other actions as needed

          return res.status(200).send({
            message: "Quiz submitted successfully, certificate generated and sent.",
            score: studentSubmission.score,
            submission: studentSubmission,
          });
        }
      

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
  getAllQuizzesTeacher,
  deleteQuiz,
  getStudentsTookQuiz,
  submitQuiz,
};
