const express = require("express");
const {
  createSubscription,
  cancelSubscription,
  teacherSubscriptions,
  studentSubscription,
  updateSubscriptionStatus,
  updateCourseStat,
  cancelPendingSubscriptions,
} = require("../controller/subscription.controller");

const { authentication } = require("../middleware/authentication.middleware");
const { isTeacher } = require("../middleware/authorization.middleware");

const subscriptionRouter = express.Router();
/*============================== Route For Create Subscription =======================================*/
subscriptionRouter.post("/create-subscription", createSubscription);

/*============================== Route For Update Subscription Status =======================================*/

subscriptionRouter.patch(
  "/update-subscription/:subscriptionId",
  authentication,
  isTeacher,
  updateSubscriptionStatus
);

/*============================== Route For Cancel Subscription Status =======================================*/

subscriptionRouter.delete(
  "/cancel-subscription/:subscriptionId",
  authentication,
  cancelSubscription
),
  /*============================== Route For Teacher Subscription  =======================================*/

  subscriptionRouter.get(
    "/teacher-subscription",
    authentication,
    teacherSubscriptions
  );

/*============================== Route For Student Subscription =======================================*/

subscriptionRouter.get(
  "/student-subscription",
  authentication,
  studentSubscription
);

/*============================== Route For Update Course Stat =======================================*/ 

subscriptionRouter.patch(
  "/course-stat/:subscriptionId/mark-completed",
  updateCourseStat
);

/*============================== Route Webhook For Stripe To Cancel Pending Status =======================================*/ 

subscriptionRouter.post(
  "/cancel-pending-subscription",
  cancelPendingSubscriptions
);

module.exports = subscriptionRouter;
