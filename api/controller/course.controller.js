const CourseModel = require("../model/course.model");
const UserModel = require("../model/user.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//to create course
const createCourse = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;
    const teacher = await UserModel.getUserById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (!teacher?.data?.isVerified) {
      return res.status(403).json({ message: "Teacher is not verified" });
    }

    const newCourse = {
      teacherId: teacherId,
      ...req.body,
    };

    const generatedId = req.generatedId
    // Create the product in Stripe
    const stripeProduct = await stripe.products.create({
      id:generatedId,
      name: newCourse.name,
      description: newCourse.description,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: newCourse.fee * 100, 
      currency: "usd",
    });

    newCourse.stripeProduct = {
      productId: stripeProduct.id,
      productPrice: stripePrice.id,
    };

    const savedCourse = await CourseModel.saveCourse(generatedId, newCourse);

    if (savedCourse.status == "SUCCESS") {
      res.status(201).json({
        message: "SUCCESS",
        data: savedCourse.data,
      });
    } else {
      return res.status(422).send({
        error: "OOPS! Sorry, something went wrong",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "OOPS! Sorry, something went wrong",
      error: error.message,
    });
  }
};
//teacher get courses
const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;
    const course = await CourseModel.getTeacherCourses(teacherId);

    if (course) {
      return res.status(200).send({
        message: course.status,
        data: course.data,
      });
    } else if (course.status === "FAILED") {
      return res.status(400).json({
        message: course.status,
        description: "No Course found",
      });
    } else {
      return res.status(400).json({
        message: course.status,
        error: course.error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const getAllCourse = async (req, res) => {
  try {
    const course = await CourseModel.getAllCourse();
    if (course) {
      return res.status(200).send({
        message: course.status,
        data: course.data,
      });
    } else if (course.status === "FAILED") {
      return res.status(400).json({
        message: course.status,
        description: "No Course found",
      });
    } else {
      return res.status(400).json({
        message: course.status,
        error: course.error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const getSingleCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await CourseModel.getCourseById(courseId);
    if (course) {
      return res.status(200).send({
        message: "SUCCESS",
        data: course,
      });
    } else {
      return res.status(404).send({
        message: "FAILED",
        description: "Course NOT FOUND",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.decodedToken._id;

    const deleteResult = await CourseModel.deleteCourse(teacherId, courseId);
    

    if (deleteResult.status === "SUCCESS") {
      return res.status(200).json({
        message: deleteResult.message,
      });
    } else {
      return res.status(500).json({
        message: "SORRY: Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "OOPS!Sorry Something went wrong",
      error: error.message,
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.decodedToken._id;
    const courseUpdateData = req.body;

    const updateResult = await CourseModel.updateCourse(
      teacherId,
      courseId,
      courseUpdateData
    );

    if (updateResult) {
      return res.status(200).json({
        message: updateResult.message,
        data: updateResult.data,
      });
    } else {
      return res.status(500).json({
        message: "SORRY: Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "OOPS! Sorry Something went wrong",
      error: error.message,
    });
  }
};

//create gig review
const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { _id } = req.decodedToken;
    const { rating, comment } = req.body;

    const isGigExist = await CourseModel.getCourseById(courseId);

    if (isGigExist.status !== "SUCCESS") {
      return res
        .status(404)
        .send({ message: "FAILED", description: "Course not found" });
    }

    const isReviewExist = isGigExist.data?.reviews.some((review) => {
      console.log(review.user.toString(), _id);
      return review.user.toString() === _id;
    });

    let updatedGig;

    if (isReviewExist) {
      updatedGig = await CourseModel.updateExistingReview(courseId, _id, req.body);
    } else {
      updatedGig = await CourseModel.addNewReview(
        courseId,
        _id,
        rating,
        comment
      );
    }

    if (updatedGig.status === "SUCCESS") {
      return res.status(201).json({
        message: "SUCCESS",
        data: updatedGig.data,
      });
    } else {
      return res.status(500).json({
        message: "FAILED",
        description: "Review could not be created or updated.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Oops! Something went wrong." });
  }
};

//get course review
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await CourseModel.getCourseById(courseId);
    if (course) {
      return res.status(200).send({
        message: "SUCCESS",
        data: course.data?.reviews,
      });
    } else {
      return res
        .status(404)
        .send({ message: "FAILED", description: "Course not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Oops! Something went wrong." });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { _id } = req.decodedToken;

    const deleteResult = await CourseModel.deleteReview(courseId, _id);
    if (deleteResult) {
      return res.status(200).json({
        message: "SUCCESS",
      });
    } else {
      return res.status(404).json({
        message: "Review not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Oops! Something went wrong.",
    });
  }
};


const courseList = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? parseInt(req.params.page) : 1;
    const courses = await CourseModel.listCourse(page, perPage);

    if (course) {
      return res.status(200).json({
        status: "SUCCESS",
        courses: courses,
      });
    } else {
      return res.status(200).json({
        status: "SUCCESS",
        courses: courses,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "OOPS! Sorry Something went wrong.",
    });
  }
};

const searchCourses = async (req, res) => {
  try {
    const { category, maxPrice, sortBy } = req.query;

    const courses = await CourseModel.searchCourses(category, maxPrice, sortBy);

    if (courses) {
      return res.status(200).json({
        status: "SUCCESS",
        courses: courses,
      });
    } else {
      return res.status(200).json({
        status: "SUCCESS",
        courses: courses,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      status: "OOPS!Sorry something went wrong",
    });
  }
};


module.exports = {
  createCourse,
  getAllCourse,
  getTeacherCourses,
  getSingleCourse,
  deleteCourse,
  updateCourse,
  createReview,
  getCourseReviews,
  deleteReview,
  courseList,
  searchCourses,
};
