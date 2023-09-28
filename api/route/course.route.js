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
/*=============================================== ROUTE FOR CREATE COURSE ========================================================*/
courseRouter.post(
  "/create",
  generateId,
  validateInput(courseValidate, "BODY"),
  authentication,
  isTeacher,
  createCourse
);

/*=============================================== ROUTE FOR UPDATE COURSE STATUS ========================================================*/
courseRouter.put(
  "/update-course/:courseId",
  authentication,
  validateInput(courseValidate,"BODY"),
  validateInput(courseIdValidate,"PARAMS"),
  updateCourse
  );

/*=============================================== ROUTE FOR DELETE COURSE ========================================================*/

courseRouter.delete("/delete/:courseId",
  validateInput(courseIdValidate,"PARAMS"),
  authentication,
  deleteCourse);
    
/*=============================================== ROUTE FOR GET TEACHER COURSE ========================================================*/

courseRouter.get("/teacher-course", authentication, getTeacherCourses);

/*=============================================== ROUTE FOR LIST ALL COURSES  ========================================================*/

courseRouter.get("/list-course", getAllCourse);

/*=============================================== ROUTE FOR GET SINGLE COURSE ========================================================*/

courseRouter.get("/single-course/:courseId", getSingleCourse);

/*=============================================== ROUTE FOR CREATE REVIEW OF COURSE ========================================================*/
courseRouter.patch("/review/:courseId",
validateInput(courseIdValidate,"PARAMS"),
validateInput(ratingCommentValidate,"BODY"),
authentication,
createReview);

/*=============================================== ROUTE FOR GET REVIEW OF COURSE ========================================================*/

courseRouter.get("/course-review/:courseId",
validateInput(courseIdValidate,"PARAMS"),
getCourseReviews);

///*=============================================== ROUTE FOR DELETE COURSE ========================================================*/

courseRouter.delete("/delete-review/:courseId", 
validateInput(courseIdValidate,"PARAMS"),
authentication,
deleteReview);
/*=============================================== ROUTE FOR PAGINATION COURSE ========================================================*/

courseRouter.get("/course-list", courseList);
/*=============================================== ROUTE FOR SEARCHING COURSE ========================================================*/

courseRouter.post("/search", searchCourses);

module.exports = courseRouter;
