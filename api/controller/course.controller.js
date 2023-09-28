const CourseModel = require("../model/course.model");
const UserModel = require("../model/user.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/*=============================================== CREATE COURSE BY TEACHER =============================================== */

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

    const generatedId = req.generatedId;
    // Create the product in Stripe
    const stripeProduct = await stripe.products.create({
      id: generatedId,
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
    console.log(savedCourse._id);

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

/*=============================================== UPDATE COURSE BY TEACHER =============================================== */

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.decodedToken._id;
    const courseUpdateData = req.body;

    const courseFound = await CourseModel.getCourseById(courseId);
    if (courseFound.status == "FAILED") {
      return res.status(404).send({
        message: "Course Not Found",
      });
    }

    if (courseFound?.data.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).send({
        message:
          "Unauthorized: You do not have permission to update this course.",
      });
    }

    // Update the course details in your database
    const updateResult = await CourseModel.updateCourse(
      teacherId,
      courseId,
      courseUpdateData
    );

    if (!updateResult) {
      return res.status(500).json({
        message: "SORRY: Something went wrong while updating the course",
      });
    }

    // Update the corresponding Stripe product and create a new price
    const stripeProduct = await stripe.products.update(
      courseFound.data.stripeProduct.productId,
      {
        name: courseUpdateData.name,
        description: courseUpdateData.description,
      }
    );

    const stripePrice = await stripe.prices.create({
      product: courseFound.data.stripeProduct.productId,
      unit_amount: courseUpdateData.fee * 100,
      currency: "usd",
    });

    // Update the course record with the new Stripe price ID
    courseFound.data.stripeProduct.productPrice = stripePrice.id;
    await CourseModel.updateCourse(courseId, courseFound.data.stripeProduct);

    return res.status(200).json({
      message: "Course updated successfully",
      data: {
        course: updateResult.data,
        stripeProduct: stripeProduct,
        stripePrice: stripePrice,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "OOPS! Sorry Something went wrong",
      error: error.message,
    });
  }
};

/*=============================================== DELETE COURSE BY TEACHER =============================================== */

const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const teacherId = req.decodedToken._id;
    console.log(teacherId);

    const courseFound = await CourseModel.getCourseById(courseId);
    if (courseFound.status == "FAILED") {
      return res.status(404).send({
        message: "Course Not Found",
      });
    }

    if (courseFound?.data.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).send({
        message:
          "Unauthorized: You do not have permission to delete this course.",
      });
    }
    const stripeProduct = courseFound.data.stripeProduct;
   

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

/*=============================================== GET TEACHER OWN COURSES =============================================== */

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

/*=============================================== GET TEACHER OWN COURSES =============================================== */

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

/*=============================================== LIST ALL COURSES OF MY WEBSITE =============================================== */

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

/*=============================================== CREATE REVIEW OF COURSE =============================================== */

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
      updatedGig = await CourseModel.updateExistingReview(
        courseId,
        _id,
        req.body
      );
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

/*=============================================== GET REVIEW OF COURSE =============================================== */

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

/*=============================================== DELETE REVIEW OF COURSE =============================================== */

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

/*=============================================== LIST COURSE BY USING PAGINATION =============================================== */

const courseList = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? parseInt(req.params.page) : 1;
    const courses = await CourseModel.listCourse(page, perPage);

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
    res.status(500).json({
      status: "ERROR",
      message: "OOPS! Sorry Something went wrong.",
    });
  }
};

/*=============================================== SEARCHING =============================================== */

const searchCourses = async (req, res) => {
  try {
    const { category, maxPrice, sortBy, name, page, pageSize } = req.query;

    const courses = await CourseModel.searchCoursesModel(
      category,
      maxPrice,
      sortBy,
      name,
      parseInt(page),
      parseInt(pageSize)
    );

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
      status: "OOPS! Sorry something went wrong",
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
