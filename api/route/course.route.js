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
const courseValidationSchema = require("../validators/course.validator");
const courseRouter = express.Router();

courseRouter.post(
  "/create",
  generateId,
  validateInput(courseValidationSchema, "BODY"),
  authentication,
  isTeacher,
  createCourse
);
courseRouter.get("/teacher-course", authentication, getTeacherCourses);
// update course by teacher
courseRouter.put(
  "/update-course/:courseId",
  authentication,
  isTeacher,
  updateCourse
);
// deleteCourse by teacher
courseRouter.delete("/delete/:gigId", authentication, isTeacher, deleteCourse);

// list all courses to user
courseRouter.get("/list-course", getAllCourse);
courseRouter.get("/single-course/:courseId", getSingleCourse);
courseRouter.get("/top-courses",)
//about the reviews
courseRouter.patch("/review/:courseId", authentication, createReview);
courseRouter.get("/course-review/:courseId", getCourseReviews);
courseRouter.delete("/deleteReview/:courseId", authentication, deleteReview);

courseRouter.get("/course-list", courseList);
courseRouter.post("/search", searchCourses);

module.exports = courseRouter;
