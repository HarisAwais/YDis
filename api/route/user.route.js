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

/*================================================= ROUTE Login User====================================================== */

userRouter.post("/login",validateInput(loginValidation,"BODY"), loginUser),

/*================================================= ROUTE Logout User====================================================== */

userRouter.post("/logout", authentication, logoutUser);

/*================================================= ROUTE Verify User====================================================== */

userRouter.patch(
  "/update-teacher/:teacherId",
  validateInput(teacherIdValidation,"PARAMS"),
  authentication,
  isAdmin,
  verifyTeacher
);

/*================================================= ROUTE See All Teacher ====================================================== */

userRouter.get("/get-teachers", authentication, isAdmin, getAllTeacher);

/*================================================= ROUTE See All Student ====================================================== */

userRouter.get("/get-students", authentication, isAdmin, getAllStudent);

/*================================================= ROUTE See All Teacher stat ====================================================== */

userRouter.get("/teacher-detail",authentication,isAdmin,teacherDetail)

/*================================================= ROUTE See All Teacher Student Stat ====================================================== */

userRouter.get("/student-detail",authentication,isAdmin,studentDetail)
/*================================================= ROUTE Create Stripe Account ====================================================== */

userRouter.post("/create-stripe-account",createStripeAccount)

module.exports = userRouter;


//profile issue and params issue