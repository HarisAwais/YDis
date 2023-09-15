const Joi = require('joi');

// Define Joi schema for user
const userValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
  role: Joi.string().valid("STUDENT", "TEACHER", "ADMIN").required().uppercase(),
  profile: Joi.string().default(
    "https://www.google.com/search?client=firefox-b-d&q=defualt+logo#vhid=hiaeBBk4UEpQUM&vssid=l"
  ),
  session: Joi.string().allow(null).default(null),
  postCode: Joi.when("role", {
    is: Joi.valid("STUDENT", "TEACHER"),
    then: Joi.string().required(),
    otherwise: Joi.string(),
  }),
  experience: Joi.when("role", {
    is: "TEACHER",
    then: Joi.string().required(),
    otherwise: Joi.string(),
  }),
  isVerified: Joi.boolean(),
});
module.exports = userValidationSchema;

