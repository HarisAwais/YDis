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
      status: "OOPS!Sorry Something went wrong",
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
      status: "OOPS!Sorry Something went wrong",
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
      status: "OOPS!Sorry Something went wrong",
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
      status: "OOPS!Sorry Something went wrong",
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
      status: "OOPS!Sorry Something went wrong",
      error: error.message,
    };
  }
};

const findUserById = async (_id) => {
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
      status: "OOPS!Sorry Something went wrong",
      error: error.message,
    };
  }
};

const verifyingTeacher = async (teacherId, isVerified) => {
  try {
    const updatedTeacher = await User.findByIdAndUpdate(
      { _id: teacherId },
      { isVerified: true },
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
      status: "OOPS!Sorry Something went wrong",
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
      status: "OOPS!Sorry Something went wrong",
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
        status: "NO_STUDENT",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: "OOPS!Sorry Something went wrong",
      error: error.message,
    };
  }
};


const getTeacherDetail = async () => {
 try {
   const pipeline = [
     {
       $match: {
         role: "TEACHER",
       },
     },
     {
       $lookup: {
         from: "courses",
         localField: "_id",
         foreignField: "teacherId",
         as: "courses",
       },
     },
     {
       $lookup: {
         from: "subscriptions",
         localField: "courses._id",
         foreignField: "_courseId",
         as: "subscriptions",
       },
     },
     {
       $lookup: {
         from: "quizzes",
         localField: "_id",
         foreignField: "createdBy",
         as: "quizzes",
       },
     },
     {
       $project: {
         _id: 1,
         firstName: 1,
         lastName: 1,
         email: 1,
         courses: {
           _id: 1,
           name: 1,
           description: 1,
         },
         subscriptions: {
           _id: 1,
           name: 1,
           fee: 1,
         },
         quizzes: {
           _id: 1,
           title: 1,
         },
       },
     },
   ];
 
   const teachers = await User.aggregate(pipeline);
   if (teachers.length > 0) {
     return {
       status: "SUCCESS",
       data: teachers,
     };
   } else {
    return{
     status: "FAILED"
    };
   }
 } catch (error) {
  console.log(error);
  return {
    status: "OOPS!Sorry Something went wrong",
    error: error.message,
  };
 }
};

const getStudentDetail = async () => {
 try {
   const pipeline = [
     {
       $match: {
         role: "STUDENT",
       },
     },
     {
       $lookup: {
         from: "subscriptions",
         localField: "_id",
         foreignField: "_studentId",
         as: "subscriptions",
       },
     },
     {
       $lookup: {
         from: "quizzes",
         localField: "_id",
         foreignField: "studentAnswers.studentId",
         as: "quizzes_taken",
       },
     },
     {
       $project: {
         _id: 1,
         firstName: 1,
         lastName: 1,
         email: 1,
         subscriptions: {
           _id: 1,
           title: 1,
           courseId: 1,
           status: 1,
         },
         quizzes_taken: {
           _id: 1,
           title: 1,
           score: { $arrayElemAt: ["$quizzes_taken.score", 1] },
         },
       },
     },
   ];
 
   const detailResult = await User.aggregate(pipeline);
 
   if (detailResult.length > 0) {
     return {
       status: "SUCCESS",
       data: detailResult,
     };
   } else {
     return {
       message: "No student details found.",
     };
   }
 } catch (error) {
  console.log(error)

  console.log(error);
  return {
    status: "OOPS!Sorry Something went wrong",
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
  getTeacherDetail,
  getStudentDetail,
};
