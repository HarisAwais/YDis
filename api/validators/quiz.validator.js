const Joi = require('joi');

const questionSchema = Joi.object({
  questionText: Joi.string().required(),
  options: Joi.array().items(Joi.string()).min(2).required(),
  correctOption: Joi.number().min(0).required(),
});

const studentAnswerSchema = Joi.object({
  studentId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      questionIndex: Joi.number().required(),
      selectedOption: Joi.number(),
    })
  ),
  score: Joi.number(),
  submittedAt: Joi.date(),
});

const quizValidationSchema = Joi.object({
  title: Joi.string().required(),
  courseId: Joi.string().required(),
  questions: Joi.array().items(questionSchema).min(1).required(),
  createdBy: Joi.string().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().required(),
  studentAnswers: Joi.array().items(studentAnswerSchema),
});

module.exports = quizValidationSchema;
