const express = require("express");
const { generateId } = require("../middleware/generateId");
const { authentication } = require("../middleware/authentication.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyTeacher,
  getAllTeacher,
  getAllStudent,
  getNearestTeacher,
  teacherDetail,
  studentDetail,
} = require("../controller/user.controller");
const { isAdmin } = require("../middleware/authorization.middleware");
const { validateInput } = require("../middleware/validateInput.middleware");
const userValidationSchema = require("../validators/user.validator");
const upload = require("../middleware/uploadProfile.middleware");
const userRouter = express.Router();

userRouter.post("/register", generateId,upload, validateInput(userValidationSchema,"BODY"), registerUser);

userRouter.post("/login", loginUser),

  userRouter.post("/logout", authentication, logoutUser);

userRouter.patch(
  "/update-teacher/:teacherId",
  authentication,
  isAdmin,
  verifyTeacher
);

userRouter.get("/nearest-teacher",getNearestTeacher)

userRouter.get("/get-teachers", authentication, isAdmin, getAllTeacher);

userRouter.get("/get-students", authentication, isAdmin, getAllStudent);

userRouter.get("/teacher-detail",authentication,isAdmin,teacherDetail)

userRouter.get("/student-detail",authentication,isAdmin,studentDetail)

module.exports = userRouter;
