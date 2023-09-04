const Joi = require('joi');

// Define the Joi schema for a course
const courseValidationSchema = Joi.object({
  teacherId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  images: Joi.array().items(Joi.string()),
  category: Joi.string().required(),
  reviews: Joi.array().items(
    Joi.object({
      user: Joi.string().required(),
      rating: Joi.number().valid(1, 2, 3, 4, 5).required(),
      comment: Joi.string().required(),
    })
  ),
  fee: Joi.number().required(),
  numOfReviews: Joi.number().default(0),
  duration: Joi.number().required(),
  numOfSales: Joi.number().default(0),
  courseOutline: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      topics: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
        })
      ),
    })
  ),
  isDeleted: Joi.boolean().default(false),
});

module.exports = courseValidationSchema;