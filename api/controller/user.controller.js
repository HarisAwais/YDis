const { generateSession } = require("../helper/generateSession");
const { signToken } = require("../helper/signToken");
const UserModel = require("../model/user.model");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      gender,
      experience,
      role,
      postCode,
    } = req.body;

    const userFound = await UserModel.getUserByEmail(email);

    if (userFound.status === "SUCCESS") {
      return res.status(409).json({
        message: "EMAIL ALREADY EXISTS",
      });
    }

    const session = generateSession();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if a file was uploaded and get its filename
    const userProfile = req.file ? req.file.filename : '';

    const newUser = {
      firstName,
      lastName,
      email,
      gender,
      password: hashedPassword,
      role,
      isVerified: role === "TEACHER" ? false : true,
      session,
      postCode,
      profile: userProfile, // Include the userProfile field in the user object
    };

    const savedUser = await UserModel.saveUser(newUser);

    if (savedUser.status === "SUCCESS") {
      res.status(201).json({
        message: "SUCCESS",
        data: savedUser.data,
      });
    } else {
      res.status(500).json({
        message: savedUser.status,
        error: savedUser.error,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await UserModel.getUserByEmail(email);

    if (userFound.status !== "SUCCESS") {
      return res.status(404).json({
        message: "INVALID USER",
      });
    }

    const isMatch = await bcrypt.compare(password, userFound.data?.password);

    if (isMatch) {
      // Generate a new session string
      const sessionString = generateSession();

      const updatedUser = await UserModel.setSessionString(
        userFound.data._id,
        sessionString
      );

      if (updatedUser.status === "SUCCESS") {
        // Sign a JWT token with user's information
        const signedToken = await signToken(updatedUser.data);
        return res.status(200).json({
          message: "SUCCESS",
          token: signedToken,
        });
      } else {
        return res.status(500).json({
          message: "OOPS! Something went wrong",
          error: updatedUser.error,
        });
      }
    } else {
      return res.status(404).json({
        message: "INVALID USER",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};
const logoutUser = async (req, res) => {
  try {
    const userId = req.decodedToken._id;

    const logoutResult = await UserModel.setSessionString(userId, null);

    if (logoutResult.status === "SUCCESS") {
      return res.status(200).json({
        message: "Logout Successfully",
      });
    } else {
      return res.status(400).json({
        message: "FAILED",
        description: "User not logout",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

const getNearestTeacher = async (req, res) => {
  const { longitude, latitude } = req.query;

  try {
    const result = await UserModel.getNearestTeacher(longitude, latitude);
    console.log(result);
    return;

    if (result.success === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Nearest teachers found",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No nearest teachers found",
        data: [],
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while finding nearest teachers",
      error: error.message,
    });
  }
};

const verifyTeacher = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const { teacherId } = req.params;

    const teacher = await UserModel.findUserById(teacherId);
    if (teacher.status === "FAILED") {
      return res.status(404).json({ message: "Teacher not found" });
    }
    const updateTeacher = await UserModel.verifyingTeacher(
      teacherId,
      isVerified
    );

    if (updateTeacher.status === "SUCCESS") {
      res.status(200).json({ message: "Teacher verified successfully" });
    } else {
      res.status(500).json({ message: "Teacher Not verified " });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "SORRY: Something went wrong" });
  }
};

const getAllTeacher = async (req, res) => {
  try {
    const result = await UserModel.getTeachers("TEACHER");

    if (result.status === "SUCCESS") {
      res.status(200).send({ data: result.data });
    } else if (result.status === "NO_TEACHERS") {
      res.status(404).send({error:"OOPS!Sorry Something went wrong"});
    }
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "OOPS!Sorry Something went wrong.",
    });
  }
};

const getAllStudent = async (req, res) => {
  try {
    const result = await UserModel.getStudents("STUDENT");

    if (result.status === "SUCCESS") {
      res.status(200).json({ data: result.data });
    } else if (result.status === "NO_TEACHERS") {
      res.status(404).json({
        message: "Sorry no student available",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "OOPS!Sorry Something went wrong.",
    });
  }
};

const teacherDetail = async (req, res) => {
  try {
    const teacherDetail = await UserModel.getTeacherDetail();

    if (detailResult) {
      return res.status(200).send({
        status: "SUCCESS",
        data: teacherDetail.data,
      });
    } else {
      return res.status(422).send({
        status: "FAILED",
        message: "OOPs! Sorry Something went wrong",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "OOPS!Sorry Something went wrong",
      error: error.message,
    });
  }
};

const studentDetail = async (req, res) => {
  try {
    const studentResult = await UserModel.getStudentDetail();

    if (studentResult.status === "SUCCESS") {
      res.status(200).send({
        data: studentResult.data,
      });
    } else {
      res.status(404).send({
        message: studentResult.message,
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getNearestTeacher,
  verifyTeacher,
  getAllTeacher,
  getAllStudent,
  getNearestTeacher,
  teacherDetail,
  studentDetail,
};
