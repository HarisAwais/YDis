const Joi = require('joi');

// Define the Joi schema for a course
const courseValidate = Joi.object({
  // teacherId: Joi.string().hex().length(24).required(),
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
  // duration: Joi.number().required(),
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

const courseIdValidate = Joi.object({courseId:Joi.string().length(24).hex()});

const ratingCommentValidate = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
});

module.exports = {courseValidate,courseIdValidate,ratingCommentValidate};
