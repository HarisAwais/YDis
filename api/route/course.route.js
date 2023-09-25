const express = require("express");
const { generateId } = require("../middleware/generateId");
const {
  getAllCourse,
  deleteCourse,
  createReview,
  getSingleCourse,
  deleteReview,
  createCourse,
  updateCourse,
  courseList,
  searchCourses,
  getTeacherCourses,
  getCourseReviews,
} = require("../controller/course.controller");
const { authentication } = require("../middleware/authentication.middleware");
const { isTeacher } = require("../middleware/authorization.middleware");
const { validateInput } = require("../middleware/validateInput.middleware");
const {courseValidate, courseIdValidate, ratingCommentValidate} = require("../validators/course.validator");
const courseRouter = express.Router();

courseRouter.post(
  "/create",
  generateId,
  validateInput(courseValidate, "BODY"),
  authentication,
  isTeacher,
  createCourse
);

//route for teacher to get his oen courses
courseRouter.get("/teacher-course", authentication, getTeacherCourses);

// update course by teacher
courseRouter.put(
  "/update-course/:courseId",
  authentication,
  isTeacher,
  validateInput(courseValidate,"BODY"),
  // validateInput(courseIdValidate,"PARAMS"),
  updateCourse
);
// deleteCourse by teacher
// courseRouter.delete("/delete/:courseId", validateInput(courseIdValidate,"PARAMS"),authentication, isTeacher, deleteCourse);

courseRouter.delete("/delete/:courseId",authentication, isTeacher, deleteCourse);

// list all courses to user
courseRouter.get("/list-course", getAllCourse);
courseRouter.get("/single-course/:courseId", getSingleCourse);
// courseRouter.get("/top-courses",)

//about the reviews
courseRouter.patch("/review/:courseId",
// validateInput(courseIdValidate,"PARAMS"),
validateInput(ratingCommentValidate,"BODY"),
authentication,
createReview);

//get product reviews
courseRouter.get("/course-review/:courseId",
// validateInput(courseIdValidate,"PARAMS"),
getCourseReviews);
//
courseRouter.delete("/delete-review/:courseId", 
// validateInput(courseIdValidate,"PARAMS"),
authentication,
deleteReview);

courseRouter.get("/course-list", courseList);

courseRouter.post("/search", searchCourses);

module.exports = courseRouter;
