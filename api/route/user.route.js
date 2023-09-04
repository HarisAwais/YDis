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
} = require("../controller/user.controller");
const { isAdmin } = require("../middleware/authorization.middleware");
const { validateInput } = require("../middleware/validateInput.middleware");
const userValidationSchema = require("../validators/user.validator");
const userRouter = express.Router();

userRouter.post("/register", validateInput(userValidationSchema,"BODY"), registerUser);

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


// forgotpassword
// userRouter.get("/getAllTeacher", authentication, isAdmin, listTeachers)

module.exports = userRouter;
