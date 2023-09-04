const express = require("express");
const {
  createSubscription,
  cancelSubscription,
  getTeacherAppointments,
  getStudentAppointments,
  updateSubscriptionStatus,
  markLessonCompleted,
  updateCourseStat,
} = require("../controller/subscription.controller");
const { isTeacher } = require("../middleware/authorization.middleware");
const { authentication } = require("../middleware/authentication.middleware");
const { generateId } = require("../middleware/generateId");
const subscriptionRouter = express.Router();

subscriptionRouter.post(
  "/create-subscription",
  authentication,
  createSubscription
);

subscriptionRouter.delete(
  "/cancel-subscription/:subscriptionId",
  authentication,
  cancelSubscription
),
  subscriptionRouter.patch(
    "/update-subscription/:subscriptionId",
    updateSubscriptionStatus
  );
subscriptionRouter.get(
  "/getTeacherAppointment",
  authentication,
  getTeacherAppointments
);
subscriptionRouter.get(
  "/getStudentAppointment",
  authentication,
  getStudentAppointments
);
subscriptionRouter.put("/subscriptions/:subscriptionId/courseStat/:moduleId/:topicId", authentication,isTeacher,updateCourseStat);

module.exports = subscriptionRouter;
