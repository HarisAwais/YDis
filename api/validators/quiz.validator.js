const Joi = require('joi');

const teacherQuestion = Joi.object({
  title: Joi.string().required(),
  courseId: Joi.string().required(),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string()).min(2).required(),
      correctOption: Joi.number().integer().min(0).required(),
    })
  ).min(1).required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
});

const studentAnswers = Joi.object({
  studentId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      questionIndex: Joi.number().integer().min(0).required(),
      selectedOption: Joi.number().integer().min(0).required(),
    })
  ).min(1).required(),
  score: Joi.number().integer().min(0).optional(),
  submittedAt: Joi.date().iso().optional(),
});

const quizIDValidate = Joi.string().alphanum().length(24).hex();

module.exports = {teacherQuestion,studentAnswers,quizIDValidate};
