const SubscriptionModel = require("../model/subscription.model");
const CourseModel = require("../model/course.model");
const {
  refundPayment,
  transferToTeacher,
  createPaymentIntent,
  capturePayment,
} = require("../helper/stripe.helper");
const zeroSetter = require("../helper/zeroSetter.helper");
const moment = require("moment");
const Subscription = require("../schema/subcription.schema");

const stripe = require("stripe")(
  "sk_test_51NpSaDC44tKvGwWA8hqaaDH5TUcJypQjZm1ygDYUYX4gUjBNQUB7Swea652dKKq6odCdFyzKtJYy8eg7KExl3vuk009AdvchfR"
);

const createSubscription = async (req, res) => {
  try {
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
      subscription
    );

    if (newSubscription) {
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
    console.error(error);
    return res.status(500).json({ message: "SORRY! Something went wrong." });
  }
};

const updateSubscriptionStatus = async (req, res) => {
  try {
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
        const teacherId = course.teacherId;

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
      options
    );

    if (updateResult.status === "SUCCESS") {
      if (status === "APPROVED") {
        const paymentIntentId =
          updateResult?.data?.stripeAccount.paymentIntentId;
        stripe.paymentIntents.retrieve(
          paymentIntentId,
          (err, paymentIntent) => {
            if (err) {
              console.error("Error retrieving PaymentIntent:", err);
            } else {
              console.log("PaymentIntent Status:", paymentIntent.status);
            }
          }
        );
       
        const capturedPayment = await capturePayment(paymentIntentId);
        const sub = await Subscription.findByIdAndUpdate(
          subscriptionId,
          { $set: { "stripeAccount.paymentStatus": "PAID" } },
          { new: true }
        );
        console.log(sub)
        return;

        // Check if payment capture was successful
        if (capturedPayment.status === "succeeded") {
          const teacherStripeAccountResult = await CourseModel.teacherAccount(
            subscriptionFound?.data?._courseId
          );

          if (teacherStripeAccountResult.status === "SUCCESS") {
            const teacherStripeAccountId =
              teacherStripeAccountResult?.data?.teacherStripeAccountId;

            // Transfer the captured payment to the teacher's Stripe account
            const transfer = await transferToTeacher(
              capturedPayment.id, // Use the captured payment's ID
              teacherStripeAccountId
            );

            if (transfer.status === "completed") {
              return res.status(200).json({
                message: "SUCCESS",
                description: "Fund transfer successfully",
              });
            } else {
              return res.status(500).json({
                message: "FAILED",
                description: "Funds transfer to teacher failed",
              });
            }
          } else {
            return res.status(500).json({
              message: "FAILED",
              description: "Failed to fetch teacher's Stripe account",
            });
          }
        } else {
          return res.status(500).json({
            message: "FAILED",
            description: "Payment capture failed",
          });
        }
      }

      return res.status(200).json({
        message: "SUCCESS",
        data: updateResult.data,
      });
    } else {
      return res.status(500).json({
        message: "FAILED",
        description: "Subscription not updated",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

//teacher cancel the subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    if (!req.decodedToken._id) {
      return res.status(403).json({
        error: "Not Authentic User.",
      });
    }

    const subscription = await SubscriptionModel.getSubscriptionById(
      subscriptionId
    );

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    //this condition for cancel subscription and refund payment to studentAccount
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (subscription.subscriptionCreationDate < sevenDaysAgo) {
      return res.status(403).json({
        message:
          "You can't cancel this subscription, the refund window has passed.",
      });
    }
    const refundResult = await refundPayment(subscription.paymentIntentId);

    if (refundResult.status === "success") {
      // Update the subscription status to reflect cancellation
      await SubscriptionModel.cancelSubscription(subscriptionId);

      return res.status(200).json({
        message: "Subscription canceled and refunded successfully.",
      });
    } else {
      return res.status(500).json({
        message: "Failed to refund the payment.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "SORRY: Something went wrong",
    });
  }
};

//teacher get his own subscription
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

//student eg==get his own subsciption
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

//teacher update course stat
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

//webhook for listening the subscription cancel
const handleSubscriptionWebhook = async (req, res) => {
  try {
    const event = req.body;

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        // Check if teacher approved within 7 days (adjust timestamp as needed)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (new Date(paymentIntent.created * 1000) < sevenDaysAgo) {
          // Refund payment to the student
          await refundPayment(paymentIntent.id);

          // Update subscription status to "REFUNDED"
        }
        break;

      default:
        // Handle other event types if needed
        break;
    }

    res.status(200).json("Webhook received and processed successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).json("Webhook processing failed.");
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  teacherSubscriptions,
  studentSubscription,
  updateCourseStat,
  handleSubscriptionWebhook,
};
