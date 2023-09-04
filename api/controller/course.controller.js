const CourseModel = require("../model/course.model");
const UserModel = require("../model/user.model")


//to create course
const createCourse = async (req, res) => {
  try {
   
    const teacherId = req.decodedToken._id;
    const teacher = await UserModel.getUserById(teacherId)

    if (!teacher.data) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (!teacher.data.isVerified) {
      return res.status(403).json({ message: "Teacher is not verified" });
    }


    req.body.image =[ req?.fullFilePath];

    const newCourse ={
      teacherId: teacherId,
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      category: req.body.category,
      reviews: [], 
      fee: req.body.fee,
      duration: req.body.duration,
      numOfSales: 0,
      courseOutline: req.body.courseOutline, 
    };

    const savedCourse = await CourseModel.saveCourse(newCourse);

    res.status(201).json({
      message: "SUCCESS",
      data: savedCourse.data, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;
    console.log("course teacherid",teacherId)

    const course = await CourseModel.getTeacherCourses(teacherId);

    console.log(course)
    return
    if (course.status === "SUCCESS") {
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
    const gig = await CourseModel.getAllGig();
    if (gig.status === "SUCCESS") {
      return res.status(200).send({
        message: gig.status,
        data: gig.data,
      });
    } else if (gig.status === "FAILED") {
      return res.status(400).json({
        message: gig.status,
        description: "No Gig found",
      });
    } else {
      return res.status(400).json({
        message: gig.status,
        error: gig.error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const getSingleGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await CourseModel.getGigById(gigId);
    if (gig) {
      return res.status(200).send({
        message: "SUCCESS",
        data: gig,
      });
    } else {
      return res.status(404).send({
        message: "FAILED",
        description: "GIG NOT FOUND",
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
    const { gigId } = req.params;
    const teacherId = req.decodedToken._id;

    // console.log("gigId:", gigId);
    // console.log("teacherId:", teacherId);

    const deleteResult = await CourseModel.deleteGig(teacherId, gigId);
    // console.log(deleteResult);

    if (deleteResult.status === "SUCCESS") {
      return res.status(200).json({
        message: deleteResult.message,
      });
    } else if (deleteResult.status === "FAILED") {
      return res.status(404).json({
        message: "Course not found",
        identifier: "01",
      });
    } else {
      return res.status(500).json({
        message: "SORRY: Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { gigId } = req.params;
    const teacherId = req.decodedToken._id;
    const gigUpdateData = req.body;
    console.log(gigId);

    const updateResult = await CourseModel.updateGig(
      teacherId,
      gigId,
      gigUpdateData
    );

    if (updateResult.status === "SUCCESS") {
      return res.status(200).json({
        message: updateResult.message,
        data: updateResult.data,
      });
    } else if (updateResult.status === "FAILED") {
      return res.status(404).json({
        message: "Course not found",
        identifier: "02",
      });
    } else {
      return res.status(500).json({
        message: "SORRY: Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

//create gig review
const createReview = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { _id } = req.decodedToken;

    const isGigExist = await CourseModel.getGigById(gigId);

    if (isGigExist.status !== "SUCCESS") {
      return res
        .status(404)
        .send({ message: "FAILED", description: "Gig not found" });
    }

    const isReviewExist = isGigExist.data.reviews.some((review) => {
      // console.log(review.user.toString(), _id);
      return review.user.toString() === _id;
    });

    let updatedGig;

    if (isReviewExist) {
      updatedGig = await CourseModel.updateExistingReview(gigId, _id, req.body);
    } else {
      updatedGig = await CourseModel.addNewReview(gigId, _id, req.body);
    }

    res.status(201).send({ message: "SUCCESS", data: updatedGig.data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Oops! Something went wrong." });
  }
};

//get gig review
const getGigReview = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await CourseModel.getGigById(gigId);
    if (gig.status !== "SUCCESS") {
      return res
        .status(404)
        .send({ message: "FAILED", description: "Gig not found" });
    }

    return res.status(200).send({
      message: "SUCCESS",
      data: gig.data.reviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Oops! Something went wrong." });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { _id } = req.decodedToken;

    const deleteResult = await CourseModel.deleteReview(gigId, _id);
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

const courseCount = async (req, res) => {
  try {
    const countResult = await CourseModel.getCourseCount();

    if (countResult.status === "SUCCESS") {
      return res.status(200).json({
        count: countResult.data,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: "No Course Available",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

const courseList = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? parseInt(req.params.page) : 1; // Convert page to integer
    const courses = await CourseModel.listCourse(page, perPage);

    res.status(200).json({
      status: "SUCCESS",
      courses: courses,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "An error occurred while listing courses.",
    });
  }
};

const searchCourses = async (req, res) => {
  try {
    const { category, maxPrice, sortBy } = req.query;

    const courses = await CourseModel.searchCourses(category, maxPrice, sortBy);

    res.status(200).json({
      status: "SUCCESS",
      courses: courses,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      error: "An error occurred while searching for courses.",
    });
  }
};

module.exports = {
  createCourse,
  getAllCourse,
  getTeacherCourses,
  getSingleGig,
  deleteCourse,
  updateCourse,
  createReview,
  getGigReview,
  deleteReview,
  courseCount,
  courseList,
  searchCourses,
};
