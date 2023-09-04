const express = require("express");
const { generateId } = require("../middleware/generateId");
const {
  getAllCourse,
  deleteCourse,
  createReview,
  getSingleGig,
  getGigReview,
  deleteReview,
  createCourse,
  updateCourse,
  courseCount,
  courseList,
  searchCourses,
  getTeacherCourses,
} = require("../controller/course.controller");
const { authentication } = require("../middleware/authentication.middleware");
const { isTeacher } = require("../middleware/authorization.middleware");
const uploadFiles = require("../middleware/uploadProfile.middleware");
const { validateInput } = require("../middleware/validateInput.middleware");
const courseValidationSchema = require("../validators/course.validator");
const courseRouter = express.Router();

courseRouter.post("/create",generateId,uploadFiles,validateInput(courseValidationSchema,"BODY"), authentication,isTeacher, createCourse);
//teache's course by teacher
courseRouter.get("/listTeacherCourse", authentication, isTeacher, getTeacherCourses);
// update course by teacher
courseRouter.put(
  "/updateCourse/:gigId",
  authentication,
  isTeacher,
  updateCourse
);
// deleteCourse by teacher
courseRouter.delete("/delete/:gigId", authentication, isTeacher, deleteCourse);

// list all courses to user
courseRouter.get("/listAllCourse", getAllCourse);
courseRouter.get("/getCourseById/:gigId", getSingleGig);
courseRouter.get("/top-courses",)
//about the reviews
courseRouter.patch("/review/:gigId", authentication, createReview);
courseRouter.get("/getCourseReview/:gigId", getGigReview);
courseRouter.delete("/deleteReview/:gigId", authentication, deleteReview);

//
courseRouter.get("/course-count", courseCount);
courseRouter.get("/course-list", courseList);
courseRouter.post("/search", searchCourses);

module.exports = courseRouter;
