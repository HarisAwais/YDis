const Course = require("../schema/course.schema");
const mongoose = require("mongoose")
//create gig
const saveCourse = async (generatedId,courseData) => {
  try {
    const course = new Course({
      _id:generatedId,
      ...courseData,
    });
    
    const savedCourse = await course.save();

    if (savedCourse) {
      return {
        status: "SUCCESS",
        data: savedCourse,
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
//get all course
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
const getCourseById = async (_courseId) => {
  try {
    console.log(_courseId)

    const course = await Course.findById({_id:_courseId}).lean().exec();
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
const updateCourse = async (teacherId, courseId, updateData) => {
  try {
    const updatedGig = await Course.findOneAndUpdate(
      { _id: courseId, teacherId },
      { $set: updateData },
      { new: true }
    )
      .lean()
      .exec();
    if (updatedGig) {
      return {
        status: "SUCCESS",
        message: "Course updated successfully",
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

//delete course by id
const deleteCourse = async (teacherId, courseId) => {
  try {
 
    const deletedCourse = await Course.findOneAndUpdate(
      { _id: courseId, teacherId },
      { isDeleted: true }
    );

    if (deletedCourse) {
      return {
        status: "SUCCESS",
        message: "Course deleted successfully",
        data: deletedCourse,
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

  try {
    const updatedGig = await Course.findByIdAndUpdate(_id, {
      $push: { reviews: { user, rating, comment } },
    });

    // console.log(updatedGig);

    if (updatedGig) {
      await incrementNumOfReviews(_id);

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

const deleteReview = async (_id, user) => {
  try {
    const updatedGig = await Course.findByIdAndUpdate(
      _id,
      { $pull: { reviews: { user } } },
      { new: true }
    );

    if (updatedGig) {
      await Course.findByIdAndUpdate(_id, { $inc: { numOfReviews: -1 } });

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

const incrementNumOfReviews = async (courseId) => {
  try {
    await Course.findByIdAndUpdate(courseId, { $inc: { numOfReviews: 1 } });
    return {
      status: "SUCCESS",
    };
  } catch (error) {
    return {
      status: "FAILED",
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

const searchCoursesModel = async (category, maxPrice, sortBy, name, page, pageSize) => {
  try {
    const query = {};

    if (category) {
      query.category = category;
    }

    if (maxPrice) {
      query.fee = { $lte: maxPrice };
    }

    if (name) {
      // Use a case-insensitive regular expression to search by name
      query.name = { $regex: new RegExp(name, 'i') };
    }

    const sortOptions = {};

    if (sortBy === "oldest") {
      sortOptions.createdAt = 1; // Sort by oldest
    } else if (sortBy === "newest") {
      sortOptions.createdAt = -1; // Sort by newest
    } else if (sortBy === "top_trending") {
      sortOptions["numOfReviews"] = -1; // Sort by top trending (numOfReviews)
    }

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // Perform the database query with pagination
    const courses = await Course.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return courses;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  searchCoursesModel: searchCoursesModel,
};


const teacherAccount = async (courseId) => {
  try {
    // Using Aggregation to fetch teacher's Stripe account by courseId
    const aggregationResult = await Course.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: "$teacher",
      },
      {
        $project: {
          _id: 0,
          teacherStripeAccountId: "$teacher.stripeAccountId",
        },
      },
    ]);

    if (aggregationResult.length === 0) {
      return {
        status: "FAILED",
        error: "Course not found or teacher not found for this course",
      };
    }

    const teacherStripeAccountId = aggregationResult[0].teacherStripeAccountId;
    console.log(teacherStripeAccountId)

    if(teacherStripeAccountId){
      return {
      
      status: "SUCCESS",
      data:teacherStripeAccountId,
    }
  }
  else{
     return {
      status: "FAILED",
      error: "An error occurred while fetching teacher's Stripe account",
    }
  }
  }
   catch (error) {
    console.error(error);
    return {
      status: "FAILED",
      error: "SORRY!Something went wrong",
    };
  }
};


module.exports = {
  saveCourse,
  getAllCourse,
  getTeacherCourses,
  getCourseById,
  deleteCourse,
  updateCourse,
  updateExistingReview,
  addNewReview,
  deleteReview,
  incrementNumOfReviews,
  listCourse,
  searchCoursesModel,
  teacherAccount
};
