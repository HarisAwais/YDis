const Joi = require('joi');

// Define Joi schema for user
const userValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
  role: Joi.string().valid('STUDENT', 'TEACHER', 'ADMIN').required(),
  profile: Joi.string(),
  session: Joi.string().allow(null),
  postCode: Joi.string().required(),
  experience: Joi.string(),
  isVerified: Joi.boolean(),
});

module.exports = userValidationSchema;
