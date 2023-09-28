const express = require("express");
const { generateId}= require("../middleware/generateId")
const { authentication } = require("../middleware/authentication.middleware");
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyTeacher,
  getAllTeacher,
  getAllStudent,
  teacherDetail,
  studentDetail,
  createStripeAccount,
} = require("../controller/user.controller");
const { isAdmin, } = require("../middleware/authorization.middleware");
const { validateInput } = require("../middleware/validateInput.middleware");
const {registerValidation, loginValidation, teacherIdValidation, } = require("../validators/user.validator");
const uploadProfile = require("../middleware/uploadProfile.middleware");
const userRouter = express.Router();

/*================================================= ROUTE Register User====================================================== */
userRouter.post("/register",
generateId,
uploadProfile,
validateInput(registerValidation,"BODY"),
registerUser);

userRouter.post("/login",validateInput(loginValidation,"BODY"), loginUser),

userRouter.post("/logout", authentication, logoutUser);

userRouter.patch(
  "/update-teacher/:teacherId",
  validateInput(teacherIdValidation,"PARAMS"),
  authentication,
  isAdmin,
  verifyTeacher
);


userRouter.get("/get-teachers", authentication, isAdmin, getAllTeacher);

userRouter.get("/get-students", authentication, isAdmin, getAllStudent);

userRouter.get("/teacher-detail",authentication,isAdmin,teacherDetail)

userRouter.get("/student-detail",authentication,isAdmin,studentDetail)
userRouter.post("/create-stripe-account",createStripeAccount)

module.exports = userRouter;


//profile issue and params issue