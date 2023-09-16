const Subscription = require("../schema/subcription.schema");
const Course = require("../schema/course.schema");
const moment = require("moment");
const mongoose = require("mongoose");
const zeroSetter = require("../helper/zeroSetter.helper");
const createSubscription = async (subscriptionData) => {
  try {
    const subscription = new Subscription(subscriptionData);
    const savedSubscription = await subscription.save();

    if (savedSubscription) {
      return {
        status: "SUCCESS",
        data: savedSubscription,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const getSubscriptionById = async (_id) => {
  try {
    const subscriptionFound = await Subscription.findById(_id).lean().exec();

    if (subscriptionFound) {
      return {
        status: "SUCCESS",
        data: subscriptionFound,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const checkTimeSlotAvailability = async (
  _courseId,
  classStartTime,
  classEndTime
) => {
  try {
    let requestedStartTime = zeroSetter(classStartTime, "date");
    let requestedEndTime = zeroSetter(classEndTime, "date");

    const overlappingSubscription = await Subscription.findOne({
      _courseId,
      status: "ACTIVE",
      $and: [
        { classEndTime: { $gt: requestedStartTime } },
        { classStartTime: { $lt: requestedEndTime } },
      ],
    });

    if (overlappingSubscription) {
      return {
        status: "FAILED",
        description: "Slot has been taken",
      };
    } else {
      return {
        status: "SUCCESS",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const calculateCourseDuration = async (_id) => {
  try {
    console.log(_id);
    const course = await Course.findById(_id);

    if (!course) {
      return {
        status: "COURSE_NOT_FOUND",
        data: null,
      };
    }

    const totalCourseDurationMillis = course.duration * 24 * 60 * 60 * 1000;

    return {
      status: "SUCCESS",
      data: totalCourseDurationMillis,
    };
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      data: null,
      error: error.message,
    };
  }
};

const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId)
      .lean()
      .exec();

    if (!subscription) {
      return { status: "FAILED", message: "Subscription not found" };
    }

    if (subscription.status == "ACTIVE") {
      return { status: "SORRY:Your Subscription is active" };
    }

    const cancelSubscription = await Subscription.findByIdAndRemove(
      subscriptionId
    );

    if (!cancelSubscription) {
      return { status: "FAILED", message: "Failed to cancel subscription" };
    } else {
      return { status: "SUCCESS", message: "Subscription cancelled" };
    }
  } catch (error) {
    console.error(error);
    return { status: "SORRY: Something went wrong" };
  }
};

const updateSubscription = async (subscriptionId, update, options) => {
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      update,
      options
    )
      .lean()
      .exec();

    if (updatedSubscription) {
      return {
        status: "SUCCESS",
        data: updatedSubscription,
      };
    } else {
      return {
        status: "FAILED",
        message: "Subscription not found or update failed.",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const teacherSubscriptions = async (teacherId) => {
  try {
    const currentDate = new Date();
    const teacherSubscriptions = await Subscription.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "_courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $match: {
          "course.teacherId": new mongoose.Types.ObjectId(teacherId),
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field if you don't need it
          classStartTime: 1,
          classEndTime: 1,
          startDate: 1,
          endDate: 1,
        },
      },
    ]);

    if (teacherSubscriptions.length > 0) {
      return { status: "SUCCESS", data: teacherSubscriptions };
    } else {
      return { status: "FAILED" };
    }
  } catch (error) {
    console.log(error);
    return {
      error: error.message,
    };
  }
};

const studentAppointments = async (_studentId) => {
  try {
    const studentAppointments = await Subscription.find({
      _studentId,
    })
      .lean()
      .exec();

    if (studentAppointments.length > 0) {
      return {
        status: "SUCCESS",
        data: studentAppointments,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

const completedTopics = async (
  subscriptionId,
  moduleId,
  topicId,
  isCompleted
) => {
  try {
    const subscriptionResult = await Subscription.findById(subscriptionId);

    if (!subscriptionResult) {
      return { status: "FAILED", message: "Subscription not found" };
    }

    let targetModule = subscriptionResult.courseStat.find(
      (module) => module.moduleId.toString() === moduleId
    );

    if (!targetModule) {
      return { status: "FAILED", message: "Module not found in subscription." };
    }

    if (topicId) {
      const topic = targetModule.topics.find(
        (topic) => topic.topicId.toString() === topicId
      );
      if (!topic) {
        return { status: "FAILED", message: "Topic not found in module." };
      }

      topic.isCompleted = isCompleted;
    } else {
      return {
        status: "FAILED",
        message: "OOPS! Something went wrong",
      };
    }

    const courseStat = await subscriptionResult.save();
    if (courseStat) {
      return {
        status: "SUCCESS",
        message: "Topic marked as completed in subscription.",
        data: subscriptionResult,
      };
    } else {
      return { status: "FAILED" };
    }
  } catch (error) {
    console.log(error);
    return {
      status: "FAILED",
      message: "An error occurred while marking the module/topic as completed.",
    };
  }
};

module.exports = {
  createSubscription,
  getSubscriptionById,
  checkTimeSlotAvailability,
  cancelSubscription,
  updateSubscription,
  teacherSubscriptions,
  studentAppointments,
  calculateCourseDuration,
  completedTopics,
};
