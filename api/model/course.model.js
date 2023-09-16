const Course = require("../schema/course.schema");
const { message } = require("../validators/course.validator");
//create gig
const saveCourse = async (userId,gigData) => {
  try {
    const gig = new Course({
      userId,
      ...gigData,
    });
    const savedGig = await gig.save();

    if (savedGig) {
      return {
        status: "SUCCESS",
        data: savedGig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};
//get all gig
const getAllCourse = async () => {
  try {
    const gig = await Course.find().lean().exec();

    if (gig.length > 0) {
      return {
        status: "SUCCESS",
        data: gig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};
//get Teacher gigs

const getTeacherCourses = async (teacherId) => {
  try {
    const course = await Course.find({ teacherId }).lean().exec();

    if (course.length > 0) {
      return {
        status: "SUCCESS",
        data: course,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

// get get by id
const getCourseById = async (_id) => {
  try {
    const course = await Course.findById(_id).lean().exec();
    if (course) {
      return {
        status: "SUCCESS",
        data: course,
      };
    } else {
      return {
        status: "FAILED",
        message: "Course not found",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

//update course by id
const updateCourse = async (teacherId, gigId, updateData) => {
  try {
    const updatedGig = await Course.findOneAndUpdate(
      { _id: gigId, teacherId },
      { $set: updateData },
      { new: true }
    )
      .lean()
      .exec();
    if (updatedGig) {
      return {
        status: "SUCCESS",
        message: "Gig updated successfully",
        data: updatedGig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

//delete gig by id
const deleteGig = async (teacherId, gigId) => {
  try {
    console.log("gigId:", gigId);
    console.log("teacherId:", teacherId);
    const deletedGig = await Course.findOneAndUpdate(
      { _id: gigId, teacherId },
      { isDeleted: true }
    );

    console.log("deletedGig:", deletedGig);

    if (deletedGig) {
      return {
        status: "SUCCESS",
        message: "Gig deleted successfully",
        data: deletedGig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const addNewReview = async (_id, user, rating, comment) => {
  // const { rating, comment } = body.reviews;

  try {
    const updatedGig = await Course.findByIdAndUpdate(_id, {
      $push: { reviews: { user, rating, comment } },
    });

    // console.log(updatedGig);

    if (updatedGig) {
      return {
        status: "SUCCESS",
        data: updatedGig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const updateExistingReview = async (_id, user, body) => {
  try {
    const { rating, comment } = body.reviews;

    // console.log(comment);

    const updatedGig = await Course.findOneAndUpdate(
      { _id, "reviews.user": user },
      { $set: { "reviews.$.rating": rating, "reviews.$.comment": comment } },
      { new: true }
    );

    //console.log(updatedGig);

    if (updatedGig) {
      return {
        status: "SUCCESS",
        data: updatedGig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const deleteReview = async (id, user) => {
  try {
    const updatedGig = await Course.findByIdAndUpdate(
      id,
      { $pull: { reviews: { user } } },
      { new: true }
    );

    if (updatedGig) {
      return {
        status: "SUCCESS",
        data: updatedGig,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const listCourse = async (page, perPage) => {
  try {
    const courses = await Course.find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("teacherId", "firstName lastName")
      .lean()
      .exec();

    return courses;
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const searchCourses = async (category, maxPrice, sortBy) => {
  try {
    const query = {};

    if (category) {
      query.category = category;
    }

    if (maxPrice) {
      query.fee = { $lte: maxPrice };
    }

    const sortOptions = {};

    if (sortBy === "oldest") {
      sortOptions.createdAt = 1; // Sort by oldest
    } else if (sortBy === "newest") {
      sortOptions.createdAt = -1; // Sort by newest
    } else if (sortBy === "top_trending") {
      sortOptions["reviews.rating"] = -1; // Sort by top trending (rating)
    }

    const courses = await Course.find(query)
      .populate("teacherId", "firstName lastName")
      .sort(sortOptions)
      .lean()
      .exec();

    return courses;
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const listingtopCourse = async (_id) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      _id,
      { $inc: { numOfSales: 1 } },
      { new: true }
    );

    if (!updatedCourse) {
      return { status: "NOT_FOUND", message: "Course not found" };
    } else {
      return { status: "SUCCESS", data: updatedCourse };
    }
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};

const getTopCourse = async () => {
  try {
    const topCourses = await Course.find({}).sort({ numOfSales: -1 }).limit(10);

    res.status(200).send({ status: "success", data: topCourses });
  } catch (error) {
    return {
      status: "SORRY: Something went wrong",
      error: error.message,
    };
  }
};
module.exports = {
  saveCourse,
  getAllCourse,
  getTeacherCourses,
  getCourseById,
  deleteGig,
  updateCourse,
  updateExistingReview,
  addNewReview,
  deleteReview,
  listCourse,
  searchCourses,
  listingtopCourse,
  getTopCourse,
};
