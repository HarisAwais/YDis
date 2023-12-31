const QuizModel = require("../model/quiz.model");
const {
  generateCertificatePdf,
  calculateScorePercentage,
} = require("../helper/generatePdf.helper");
const Subscription = require("../schema/subcription.schema");
const Quiz = require("../schema/quiz.schema");


/*=============================================== CREATE QUIZ =============================================== */

const createQuiz = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;

    // Encode the questions before saving them to the database
    const encodedQuestions = req.body.questions.map((question) => {
      const encodedOptions = question.options.map((option) =>
        Buffer.from(option).toString('base64')
      );

      return {
        ...question,
        options: encodedOptions,
      };
    });

    const newQuiz = {
      createdBy: teacherId,
      ...req.body,
      questions: encodedQuestions, 
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

/*=============================================== UPDATE QUIZ =============================================== */

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

// const getCoursesQuiz = async=()=>{
//   const 
// }
/*=============================================== DELETE QUIZ =============================================== */

const deleteQuiz = async (req, res) => {
  try {
    const user = req.decodedToken._id;
    const quizId = req.params.quizId;
    const deletedQuiz = await QuizModel.deleteQuiz(quizId, user);
    if (deletedQuiz.status == "SUCCESS") {
      res.status(200).json({ message: "Quiz Deleted Successfully" });
    } else {
      return res.status(422).send({ message: "OOPS! Something went wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*=============================================== STUDENT SUBMIT QUIZ =============================================== */

const submitQuiz = async (req, res) => {
  try {
    const  quizId  = req.params.quizId;
    const { answers } = req.body;
    const studentId = req.decodedToken._id;

    const quiz = await QuizModel.quizById(quizId);
    const score = QuizModel.calculateScore(quiz?.data?.questions, answers);

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

/*=============================================== GET THE STUDENT WHO GIVE THE EXAM =============================================== */

const studentsWhoTookQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
   
    const quizResponse = await QuizModel.quizById(quizId);

    if (!quizResponse) {
      return res.status(404).json({
        status: quizResponse.status,
        message: quizResponse.message,
      });
    }

    const quiz = quizResponse.data;

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

/*=============================================== CERTIFICATE FOR USER =============================================== */

const getCertificate = async (req, res) => {
  try {
    const studentId = req.decodedToken._id; 
    const quizData = await QuizModel.getCertificate(studentId);


    if (quizData.status === "SUCCESS") {
      const { studentName, teacherName, courseName, score, questions } = quizData.data;

      // Calculate percentage and perform actions based on it
      const maxPossibleScore = questions.length;
      const percentage = (score / maxPossibleScore) * 100;
      const threshold = 80;

      if (percentage >= threshold) {
        const pdfFilename = `certificate_${quizData?.data?._id}.pdf`;

        const pdfPath = await generateCertificatePdf(
          studentName,
          teacherName,
          courseName,
          new Date().toDateString(),
          pdfFilename
        );

        // Provide the certificate PDF as a download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${pdfFilename}"`
        );
        res.sendFile(pdfPath);
      } else {
        res.status(403).json({
          message: "Sorry, your percentage does not meet our requirements.",
        });
      }
    } else {
      res.status(403).json({
        message: "Access denied. You are not authorized to access this certificate.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};




module.exports = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  studentsWhoTookQuiz,
  submitQuiz,
  getCertificate,
};
