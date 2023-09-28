const Subscription = require("../schema/subcription.schema");
const Course = require("../schema/course.schema");
const mongoose = require("mongoose");
const zeroSetter = require("../helper/zeroSetter.helper");

/* ======================= Create Subscription ======================== */

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
      status: "SORRY:Something went wrong",
      error: error.message,
    };
  }
};
/* ======================= Get Subscription By Id ======================== */
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
      status: "OOPS! Something went wrong",
      error: error.message,
    };
  }
};

/* ======================= Check TimeSlot If Available ======================== */

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
      status: "APPROVED",
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

/* ======================= Calculate Duration Of Course  ======================== */

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

/* ======================= Cancel Subscription Of Course  ======================== */

const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId)
      .lean()
      .exec();

    if (!subscription) {
      return { status: "FAILED", message: "Subscription not found" };
    }

    if (subscription.status === "APPROVED") {
      return {
        status: "APPROVED",
        message: "Your subscription is already approved.",
      };
    }

    const cancelSubscription = await Subscription.findByIdAndDelete(
      subscriptionId
    );

    if (cancelSubscription) {
      return { status: "SUCCESS", message: "Subscription cancelled" };
    } else {
      return { status: "FAILED", message: "Failed to cancel subscription" };
    }
  } catch (error) {
    console.error(error);
    return { status: "SORRY: Something went wrong" };
  }
};

/* ======================= Update Subscription Of Course  ======================== */

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

/* ======================= Teacher Get own Subscription  ======================== */

const teacherSubscriptions = async (teacherId) => {
  try {
    const pipeline = [
      { $match: { status: 'APPROVED' } },
      {
        $lookup: {
          from: "courses", 
          localField: "_courseId",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $match: {
          "courses.teacherId": new mongoose.Types.ObjectId(teacherId), 
        },
      },
    
    ];
    const result = await Subscription.aggregate(pipeline);

    if (result) {
      return { status: "SUCCESS", data: result };
    } else {
      return { status: "FAILED" };
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ======================= Student Get own Subscription  ======================== */

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

/* ======================= Teacher Marked Completed Subscription  ======================== */

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

/* ======================= Get Teacher Stripe Account  ======================== */

const teacherAccount = async () => {
  const aggregationResult = await Subscription.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(subscriptionId) },
    },
    {
      $lookup: {
        from: "courses", // The name of the Course collection
        localField: "_courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: "$course",
    },
    {
      $lookup: {
        from: "users", // The name of the User collection
        localField: "course.teacherId",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        _id: 0,
        teacherStripeAccountId: "$teacher.stripeAccountId",
      },
    },
  ]);

  if (aggregationResult.length === 0) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  const teacherStripeAccountId = aggregationResult[0].teacherStripeAccountId;

  // Now you have the teacherStripeAccountId
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
  teacherAccount,
};
