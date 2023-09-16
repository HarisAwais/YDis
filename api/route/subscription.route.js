const express = require("express");
const {
  createSubscription,
  cancelSubscription,
  teacherSubscriptions,
  studentSubscription,
  updateSubscriptionStatus,
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
  
  subscriptionRouter.patch(
    "/update-subscription/:subscriptionId",
    updateSubscriptionStatus
  );
  
  subscriptionRouter.delete(
    "/cancel-subscription/:subscriptionId",
    authentication,
    cancelSubscription
    ),

subscriptionRouter.get(
  "/teacher-subscription",
  authentication,
  teacherSubscriptions
);
subscriptionRouter.get(
  "/student-subscription",
  authentication,
  studentSubscription
);
subscriptionRouter.patch("/course-stat/:subscriptionId/mark-completed", updateCourseStat);


module.exports = subscriptionRouter;
