const express = require("express");
const {
  createSubscription,
  cancelSubscription,
  teacherSubscriptions,
  studentSubscription,
  updateSubscriptionStatus,
  updateCourseStat,
} = require("../controller/subscription.controller");

const { authentication } = require("../middleware/authentication.middleware");
const {isTeacher} = require("../middleware/authorization.middleware")

const subscriptionRouter = express.Router();

//student create subscription
subscriptionRouter.post(
  "/create-subscription",
  authentication,
  createSubscription
  );
  
  //Teacher will update status of subscription (pending,active or completed) 
  subscriptionRouter.patch(
    "/update-subscription/:subscriptionId",
    authentication,
    isTeacher,
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
