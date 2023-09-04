const User = require("../schema/user.schema");
const Subscription = require("../schema/subcription.schema");
const saveUser = async (userData) => {
  try {
    const user = new User({
      ...userData,
    });

    const savedUser = await user.save();

    if (savedUser) {
      return {
        status: "SUCCESS",
        data: savedUser,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email }).lean().exec();
    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const getStudentById = async (_id) => {
  try {
    const user = await Student.findById(_id).lean().exec();
    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const setSessionString = async (_id, string = null) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
       _id, 
      { session: string },
      { new: true }
    );

    if (!updatedUser) {
      return {
        status: "FAILED",
        error: "User not found",
      };
    }

    return {
      status: "SUCCESS",
      data: updatedUser,
    };
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const getUserById = async (_id) => {
  try {
    const user = await User.findById(_id).lean().exec();

    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const findUserById = async (_id) => {
  try {
    const user = await User.findById(_id)
    .lean()
    .exec();

    if (user) {
      return {
        status: "SUCCESS",
        data: user,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const verifyingTeacher = async (teacherId, isVerified) => {
  try {
    const updatedTeacher = await User.findByIdAndUpdate(
      { _id: teacherId },
      { isVerified: isVerified },
      { new: true }
    );

    if (updatedTeacher) {
      return {
        status: "SUCCESS",
        data: updatedTeacher,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const getTeachers = async (role) => {
  try {
    const teachers = await User.find({ role: role }).lean().exec();

    if (teachers.length > 0) {
      return {
        status: "SUCCESS",
        data: teachers,
      };
    } else {
      return {
        status: "NO_TEACHERS",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const getStudents = async (role) => {
  try {
    const students = await User.find({ role: role }).lean().exec();

    if (students.length > 0) {
      return {
        status: "SUCCESS",
        data: students,
      };
    } else {
      return {
        status: "NO_TEACHERS",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};
const getNearestTeacher = async (longitude, latitude) => {
  try {
    const nearestTeachers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            // coordinates: [parseFloat(longitude), parseFloat(latitude)],
            coordinates: [17.43952, 78.49657],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 10000, // Maximum distance in meters (adjust as needed)
        },
      },
      {
        $match: {
          role: "TEACHER",
          isVerified: true,
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          secondName: 1,
          distance: 1,
        },
      },
    ]);

    // Check if there are any nearest teachers found
    if (nearestTeachers.length === 0) {
      return {
        status: "FALSE",
        message: "No nearest teachers found",
        nearestTeachers: [],
      };
    }

    // Return the list of nearest teachers with a success status
    return {
      status: "SUCCESS",
      data: nearestTeachers,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error occurred while finding nearest teachers",
      error: error.message,
    };
  }
};

module.exports = {
  saveUser,
  getUserByEmail,
  setSessionString,
  getUserById,
  findUserById,
  getStudentById,
  verifyingTeacher,
  getTeachers,
  getStudents,
  getNearestTeacher,
};