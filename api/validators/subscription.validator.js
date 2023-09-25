const Joi = require('joi');

const subscriptionValidationSchema = Joi.object({
  _courseId: Joi.string().required(),
  _studentId: Joi.string().required(),
  classStartTime: Joi.date().required(),
  classEndTime: Joi.date().required(),
  duration: Joi.number().default(60),
  status: Joi.string().valid('PENDING',"APPROVED", 'COMPLETED').default('PENDING').uppercase(),
  startDate: Joi.date(),
  endDate: Joi.date(),
});

module.exports = subscriptionValidationSchema;
