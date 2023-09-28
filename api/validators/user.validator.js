const Joi = require('joi');
const { USER_ROLE, GENDER,PROFILE } = require('../../config/constant'); 

// Define Joi schema for user
const registerValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  gender: Joi.string().valid(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER).required(),
  role: Joi.string().valid(USER_ROLE.STUDENT, USER_ROLE.TEACHER).required().uppercase(),
  profile: Joi.string().default(
    PROFILE.PROFILE
  ),
  session: Joi.string().allow(null).default(null),

  experience: Joi.string().when("role", {
    is: USER_ROLE.TEACHER,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(''), 
  }),
  isVerified: Joi.boolean().default(false), 
  stripeAccountId: Joi.string().default(null), 

});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const teacherIdValidation = Joi.object({teacherId:Joi.string().required()});


const verifiyValidation =  Joi.object({isVerified:Joi.string().length(24).hex().required()});


module.exports = {registerValidation,loginValidation,verifiyValidation,teacherIdValidation};
