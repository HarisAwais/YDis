const SubscriptionModel = require("../model/subscription.model");
const zeroSetter = require("../helper/zeroSetter.helper");
const CourseModel = require("../model/course.model");
const moment = require("moment");

const createSubscription = async (req, res) => {
  try {
    const { _courseId, classStartTime, classEndTime } = req.body;
    const studentId = req.decodedToken._id ;

    let requestedStartTime = zeroSetter(classStartTime, "date");
    let requestedEndTime = zeroSetter(classEndTime, "date");

    // Fetch the course document
    const course = await CourseModel.getCourseById(_courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const subscribed = {
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
    };

    // Create the subscription with calculated start and end dates
    const newSubscription = await SubscriptionModel.createAppointment(
      subscribed
    );

    return res.status(201).json({
      message: "Subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;
    let { classStartTime, classEndTime } = req.body;

    const condition = {
      _id: subscriptionId,
    };
    let update = {
      status: status,
    };
    let options = {
      new: true,
    };

    if (status === "ACTIVE") {
      let subscriptionFound;

      if (!classStartTime || !classEndTime) {
        subscriptionFound = await SubscriptionModel.getSubscriptionById(
          subscriptionId
        );

        if (subscriptionFound.status === "SUCCESS") {
          classStartTime = subscriptionFound.data.classStartTime;
          classEndTime = subscriptionFound.data.classEndTime;
        } else {
          return res
            .status(404)
            .send({ message: "FAILED", error: subscriptionFound.error });
        }
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

      // console.log(subscriptionFound.data?._courseId)
      // return
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
      message: "Internal server error.",
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    if (!req.decodedToken._id) {
      return res.status(403).json({
        error: "Not Authentic User.",
      });
    }

    const cancelResult = await SubscriptionModel.cancelSubscription(
      subscriptionId
    );

    if (cancelResult.status === "SUCCESS") {
      return res.status(200).json({
        message: "Subscription canceled successfully.",
      });
    } else if (cancelResult.status === "SUBSCRIPTION_NOT_FOUND") {
      return res.status(404).json({
        error: "Subscription not found.",
      });
    } else if (cancelResult.status === "SUBSCRIPTION_NOT_CANCELLABLE") {
      return res.status(400).json({
        error: "Subscription cannot be canceled.",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const teacherSubscriptions = async (req, res) => {
  try {

    const teacherId = req.decodedToken._id;
    const result = await SubscriptionModel.teacherSubscriptions(teacherId);

    if(result.status=="SUCCESS"){
      return res.status(200).send({data:result.data});
    }
    else{
      return res.status(422).send({message:"OOPS!Something went wrong"})
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal server error." });
  }
};

const studentSubscription = async (req, res) => {
  try {
    const studentAppointments = await SubscriptionModel.studentAppointments(
      req.decodedToken._id
    );
    if (studentAppointments) {
      return res.json({
        message: "Student appointments fetched successfully.",
        data: studentAppointments.data,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching student appointments." });
  }
};


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
      res
        .status(201)
        .send({
          message: "Topic marked as completed",
          data: result.data,
        });
    } else {
      res.status(404).send({ message: result.message });
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while adding the module/topic." });
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  teacherSubscriptions,
  studentSubscription,
  updateCourseStat,
};

