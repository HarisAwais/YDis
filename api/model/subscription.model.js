const Subscription = require("../schema/subcription.schema");
const Course = require("../schema/course.schema");
const zeroSetter = require("../helper/zeroSetter.helper");
const createAppointment = async (appointmentData) => {
  try {
    const appointment = new Subscription(appointmentData);
    const savedAppointment = await appointment.save();
    console.log(savedAppointment);

    if (savedAppointment) {
      return {
        status: "SUCCESS",
        data: savedAppointment,
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

// const checkTimeSlotAvailability = async (courseId, startTime, endTime, startDate, endDate) => {
//   try {
//     const overlappingSubscriptions = await Subscription.find({
//       _courseId: courseId,
//       $and: [
//         {
//           $or: [
//             {
//               classStartTime: { $gte: startTime, $lt: endTime },
//             },
//             {
//               classEndTime: { $gt: startTime, $lte: endTime },
//             },
//             {
//               classStartTime: { $lt: startTime },
//               classEndTime: { $gt: endTime },
//             },
//           ],
//         },
//         {
//           $or: [
//             {
//               startDate: { $gte: startDate, $lt: endDate },
//             },
//             {
//               endDate: { $gt: startDate, $lte: endDate },
//             },
//             {
//               startDate: { $lt: startDate },
//               endDate: { $gt: endDate },
//             },
//           ],
//         },
//       ],
//       status: { $ne: "cancelled" },
//     });

//     return overlappingSubscriptions.length === 0;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };

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

    console.log(overlappingSubscription);

    return overlappingSubscription?.length ? true : false;
  } catch (error) {
    console.error(error);
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }

  // try {
  //   console.log("Checking time slot availability...");

  //   // Extract the time part from classStartTime and classEndTime
  //   const requestedStartTime = moment(classStartTime).format('HH:mm');

  //   const requestedEndTime = moment(classEndTime).format('HH:mm');

  //   // Find any subscription for the same course that overlaps in time
  //   const overlappingSubscription = await Subscription.findOne()

  //   if (overlappingSubscription) {
  //     // Check if the requested time overlaps with the existing subscription's time
  //     const existingStartTime = moment(overlappingSubscription.classStartTime).format('HH:mm');
  //     const existingEndTime = moment(overlappingSubscription.classEndTime).format('HH:mm');

  //     if (
  //       (requestedStartTime >= existingStartTime && requestedStartTime < existingEndTime) ||
  //       (requestedEndTime > existingStartTime && requestedEndTime <= existingEndTime)
  //     ) {
  //       console.log("Slot not available.");
  //       return {
  //         status: "FAILED",
  //         isSlotAvailable: false,
  //       };
  //     }
  //   }

  //   console.log("Slot available.");
  //   return {
  //     status: "SUCCESS",
  //     isSlotAvailable: true,
  //   };
  // } catch (error) {
  //   console.error(error);
  //   return {
  //     status: "INTERNAL_SERVER_ERROR",
  //     error: error.message,
  //   };
  // }
};

const calculateCourseDuration = async (courseId) => {
  try {
    // console.log(courseId);
    const course = await Course.findById(courseId);

    // console.log(course);
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

const subscriptionFindByIdAndRemove = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId)
      .lean()
      .exec();

    if (subscription.status !== "pending") {
      return { status: "SUBSCRIPTION_NOT_CANCELLABLE" };
    }

    await Subscription.findByIdAndRemove(subscriptionId);

    return { status: "SUCCESS", subscription: subscription };
  } catch (error) {
    console.error(error);
    return { status: "INTERNAL_SERVER_ERROR" };
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

const getTeacherAppointments = async (teacherId) => {
  try {
    

    const teacherAppointments = await Subscription.find({
    "_courseId.teacherId": teacherId,
  }).lean().exec()

    return teacherAppointments;
  } catch (error) {
    throw new Error("Error fetching teacher appointments.");
  }
};

const studentAppointments = async (studentId) => {
  try {
    console.log(studentId);
    const studentAppointments = await Subscription.find({
      _studentId: studentId,
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
const blockSlotsDuringCourse = async (courseId, startDate, endDate) => {
  try {
    // Find all subscriptions for the course that fall within the course duration
    const overlappingSubscriptions = await Subscription.find({
      _courseId: courseId,
      classStartTime: { $gte: startDate, $lt: endDate },
      status: { $in: ["approved", "active"] },
    }).exec();

    // Loop through each overlapping subscription and mark slots as blocked
    for (const subscription of overlappingSubscriptions) {
      const { classStartTime, classEndTime } = subscription;

      // Assuming there's a slot schema with a reference to the subscription
      // You need to update your actual schema and logic accordingly
      const slotsToUpdate = await Slot.find({
        subscription: subscription._id,
        startTime: { $gte: classStartTime, $lt: classEndTime },
      }).exec();

      for (const slot of slotsToUpdate) {
        slot.status = "blocked";
        await slot.save();
      }
    }

    return {
      status: "SUCCESS",
    };
  } catch (error) {
    return {
      status: "INTERNAL_SERVER_ERROR",
      error: error.message,
    };
  }
};

module.exports = {
  createAppointment,
  getSubscriptionById,
  checkTimeSlotAvailability,
  subscriptionFindByIdAndRemove,
  updateSubscription,
  getTeacherAppointments,
  studentAppointments,
  calculateCourseDuration,
  blockSlotsDuringCourse,
};
