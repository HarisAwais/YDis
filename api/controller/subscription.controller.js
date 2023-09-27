const SubscriptionModel = require("../model/subscription.model");
const CourseModel = require("../model/course.model");
const {
  createPaymentIntent,
  capturePayment,
} = require("../helper/stripe.helper");
const zeroSetter = require("../helper/zeroSetter.helper");
const moment = require("moment");
const mongoose = require("mongoose");
const conn = mongoose.connection;

const Subscription = require("../schema/subcription.schema");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/*============================ create subscription By Student ================================*/

const createSubscription = async (req, res) => {
  let session = await conn.startSession();
  session.startTransaction();
  try {
    const opts = { session };

    const { _courseId, classStartTime, classEndTime } = req.body;
    // const studentId = req.decodedToken._id;

    const studentId = req.body.studentId;
    const paymentMethodId = req.body.paymentMethodId;

    let requestedStartTime = zeroSetter(classStartTime, "date");
    let requestedEndTime = zeroSetter(classEndTime, "date");

    // Fetch the course document
    const course = await CourseModel.getCourseById(_courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const paymentAmount = Math.round(course?.data?.fee * 100);

    // Create a Payment Intent with Stripe
    const paymentIntent = await createPaymentIntent(
      _courseId,
      studentId,
      paymentAmount,
      paymentMethodId
    );

    if (!paymentIntent) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(422).json({
        status: "FAILED",
        message: "Sorry, Something went wrong",
      });
    }

    // Calculate the subscription start and end dates
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionStartDate.getDate() + 7);

    // Store the subscription creation timestamp
    const subscriptionCreationDate = new Date();

    const subscription = {
      _courseId,
      _studentId: studentId,
      classStartTime: requestedStartTime,
      classEndTime: requestedEndTime,
      courseStat: course.data.courseOutline.map((module) => ({
        moduleId: module._id,
        isCompleted: false,
        topics: module.topics.map((topic) => ({
          topicId: topic._id,
          isCompleted: false,
        })),
      })),
      stripeAccount: {
        paymentIntentId: paymentIntent.id,
        subscriptionStartDate,
        subscriptionEndDate,
        subscriptionCreationDate,
      },
    };

    // Create the subscription with calculated start and end dates
    const newSubscription = await SubscriptionModel.createSubscription(
      subscription,
      opts
    );

    if (newSubscription) {
      await session.commitTransaction();
      await session.endSession();
      return res.status(201).json({
        message: "Subscription created successfully.",
        data: newSubscription,
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      return res.status(400).json({
        message: "Subscription not created successfully.",
      });
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return res.status(500).json({ message: "SORRY! Something went wrong." });
  }
};

/*============================ updateSubscriptionStatus By Teacher ============================*/

const updateSubscriptionStatus = async (req, res) => {
  let session = await conn.startSession();
  session.startTransaction();
  try {
    const opts = { session };

    const { subscriptionId } = req.params;
    const { status } = req.body;
    let { classStartTime, classEndTime } = req.body;

    const user = req.decodedToken._id;

    let subscriptionFound;

    const condition = {
      _id: subscriptionId,
    };
    let update = {
      status: status,
    };
    let options = {
      new: true,
    };
    subscriptionFound = await SubscriptionModel.getSubscriptionById(
      subscriptionId
    );

    if (status === "APPROVED") {
      if (subscriptionFound.status === "SUCCESS") {
        const course = subscriptionFound?.data?._courseId;

        if (String(course.teacherId) !== String(user._id)) {
          return res.status(403).json({ message: "Access denied" });
        }

        classStartTime = subscriptionFound?.data?.classStartTime;
        classEndTime = subscriptionFound?.data?.classEndTime;
      } else {
        return res
          .status(404)
          .send({ message: "FAILED", error: subscriptionFound.error });
      }

      const slotAvailabilityResult =
        await SubscriptionModel.checkTimeSlotAvailability(
          subscriptionFound.data?._courseId,
          classStartTime,
          classEndTime
        );

      if (slotAvailabilityResult.status === "FAILED") {
        return res.status(404).send({
          message: "FAILED",
          description: "Slot has been taken",
        });
      }

      const durationResult = await SubscriptionModel.calculateCourseDuration(
        subscriptionFound.data?._courseId
      );

      if (durationResult.status === "SUCCESS") {
        const dateNow = zeroSetter(Date.now(), "time");
        const endDate = moment(dateNow).add(
          durationResult.data,
          "milliseconds"
        );
        update.startDate = dateNow;
        update.endDate = endDate.toDate();
      } else {
        return res.status(500).json({
          message: "Failed to calculate course duration.",
        });
      }
    }

    const updateResult = await SubscriptionModel.updateSubscription(
      condition,
      update,
      options,
      opts
    );

    if (updateResult.status === "SUCCESS") {
      if (status === "APPROVED") {
        const paymentIntentId =
          updateResult?.data?.stripeAccount.paymentIntentId;

        const capturedPayment = await capturePayment(paymentIntentId);

        if (capturedPayment.status === "succeeded") {
          await Subscription.findByIdAndUpdate(subscriptionId, {
            $set: { "stripeAccount.paymentStatus": "PAID" },
          });

          await session.commitTransaction();
          await session.endSession();

          return res.status(200).json({
            message: "SUCCESS",
            data: updateResult.data,
          });
        } else {
          await session.abortTransaction();
          await session.endSession();

          return res.status(500).json({
            message: "FAILED",
            description: "Payment capture failed",
          });
        }
      } else {
        await session.commitTransaction();
        await session.endSession();

        return res.status(200).json({
          message: "SUCCESS",
          data: updateResult.data,
        });
      }
    } else {
      await session.abortTransaction();
      await session.endSession();

      return res.status(500).json({
        message: "FAILED",
        description: "Subscription not updated",
      });
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

/*============================ cancelSubscription By Student============================*/

const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    // Check if the student is authenticated
    if (!req.decodedToken._id) {
      return res.status(403).json({
        error: "Not Authentic User.",
      });
    }

    const subscription = await SubscriptionModel.getSubscriptionById(
      subscriptionId
    );

    // Check if the subscription status is 'SUCCESS'
    if (subscription.status === "SUCCESS") {
      if (subscription.data?._studentId.toString() !== req.decodedToken._id) {
        return res.status(403).json({
          error: "Subscription does not belong to this student.",
        });
      }

      // Attempt to cancel the subscription in Stripe
      try {
        const canceledSubscription = await stripe.products.del(subscription.data?.stripeAccount.subscriptionId);


        // canceledSubscription object will contain information about the canceled subscription in Stripe
      } catch (stripeError) {
        console.error(stripeError);
        return res.status(500).json({
          message: "Failed to cancel the subscription in Stripe.",
        });
      }

      // Update the subscription status in your database
      const cancelResult = await SubscriptionModel.cancelSubscription(
        subscriptionId
      );

      if (cancelResult.status === "APPROVED") {
        return res.status(200).json({
          message: cancelResult.message, // Send the custom approval message
        });
      } else if (cancelResult.status === "SUCCESS") {
        return res.status(200).json({
          message: "Subscription canceled successfully.",
        });
      } else {
        return res.status(500).json({
          message: "Failed to cancel the subscription: " + cancelResult.message,
        });
      }
    } else {
      return res.status(500).json({
        message: "Failed to cancel the subscription: " + subscription.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

/*============================ Get TeacherSubscription By Teacher============================*/

const teacherSubscriptions = async (req, res) => {
  try {
    const teacherId = req.decodedToken._id;
    const result = await SubscriptionModel.teacherSubscriptions(teacherId);

    if (result.status == "SUCCESS") {
      return res.status(200).json({ data: result.data });
    } else {
      return res.status(422).json({ message: "OOPS!Something went wrong" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

/*============================ Get StudentSubscription By Student============================*/

const studentSubscription = async (req, res) => {
  try {
    const studentAppointments = await SubscriptionModel.studentAppointments(
      req.decodedToken._id
    );
    if (studentAppointments) {
      return res.json({
        message: "Student Subscription Fetched Successfully.",
        data: studentAppointments.data,
      });
    } else {
      return res.json({ message: "No Subscription Found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "SORRY!Something Went Wrong." });
  }
};

/*============================ Marked CourseStat and Module Completed By Teacher ============================*/

const updateCourseStat = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { moduleId, topicId, isCompleted } = req.body;

    const result = await SubscriptionModel.completedTopics(
      subscriptionId,
      moduleId,
      topicId,
      isCompleted
    );

    if (result.status === "SUCCESS") {
      res.status(201).json({
        message: "Topic marked as completed",
        data: result.data,
      });
    } else {
      res.status(404).json({ message: "SORRY: Something Went Wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: "SORRY: Something Went Wrong." });
  }
};

/*============================ Web Hook For Cancel The Subscription ============================*/

const cancelPendingSubscriptions = async () => {
  try {
    const sevenDaysAgo = moment().subtract(7, "days").toDate();

    const pendingSubscriptions = await Subscription.find({
      "stripeAccount.paymentStatus": "PENDING",
      "stripeAccount.subscriptionCreationDate": { $lte: sevenDaysAgo },
    });

    for (const subscription of pendingSubscriptions) {
      await SubscriptionModel.cancelSubscription(subscription._id);
    }
  } catch (error) {
    console.error("Error cancelling pending subscriptions:", error);
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  teacherSubscriptions,
  studentSubscription,
  updateCourseStat,
  cancelPendingSubscriptions,
};
