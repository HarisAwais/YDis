const SubscriptionModel = require("../model/subscription.model");
const zeroSetter = require("../helper/zeroSetter.helper");
const CourseModel = require("../model/course.model")

const createSubscription = async (req, res) => {
  try {
    const { _courseId, classStartTime, classEndTime } = req.body;
    const studentId = req.decodedToken._id || req.body._studentId;

    let requestedStartTime = zeroSetter(classStartTime, "date");
    let requestedEndTime = zeroSetter(classEndTime, "date");

    // Create the subscription with calculated start and end dates
    const newSubscription = await SubscriptionModel.createAppointment({
      _courseId,
      _studentId: studentId,
      classStartTime: requestedStartTime,
      classEndTime: requestedEndTime,
    });

    await CourseModel.listingtopCourse(_courseId)

    return res.status(201).json({
      message: "Subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    console.log(req.params);
    console.log(req.decodedToken._id);
    const { subscriptionId } = req.params;
    if (!req.decodedToken._id) {
      return res.status(403).json({
        error: "Not Authentic User.",
      });
    }

    const cancelResult = await SubscriptionModel.subscriptionFindByIdAndRemove(
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

    if (status === "active") {
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

      const isSlotAvailable = await SubscriptionModel.checkTimeSlotAvailability(
        subscriptionFound.data._courseId,
        classStartTime,
        classEndTime
      );

      if (!isSlotAvailable) {
        return res.status(404).send({
          message: "FAILED",
          description: "Slot has been taken",
          error: isSlotAvailable.error,
        });
      }

      // Calculate course duration and set end date
      const durationResult = await SubscriptionModel.calculateCourseDuration(
        req.body.courseId
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

const getTeacherAppointments = async (req, res) => {
  try {
    // console.log(req.decodedToken.role)

    const teacherId = req.decodedToken._id;
    console.log(teacherId);
    const teacherAppointments = await SubscriptionModel.getTeacherAppointments(
      req.decodedToken._id
    );
    console.log(teacherAppointments);
    return res.status(200).json(teacherAppointments);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getStudentAppointments = async (req, res) => {
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
    const { subscriptionId, moduleId, topicId } = req.params;
    const isCompleted = req.body.isCompleted; 

    
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const moduleIndex = subscription.courseStat.findIndex((module) => module._id.toString() === moduleId);

    if (moduleIndex === -1) {
      return res.status(404).json({ message: "Module not found in courseStat" });
    }

    // Find the topic within the module
    const topicIndex = subscription.courseStat[moduleIndex].topics.findIndex((topic) => topic._id.toString() === topicId);

    if (topicIndex === -1) {
      return res.status(404).json({ message: "Topic not found in module" });
    }

    // Update the completion status of the topic
    subscription.courseStat[moduleIndex].topics[topicIndex].isCompleted = isCompleted;

    // Save the updated subscription
    await subscription.save();

    res.status(200).json({ message: "Topic completion status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};




module.exports = {
  createSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  getTeacherAppointments,
  getStudentAppointments,
  updateCourseStat
};

// const updateSubscriptionStatus = async (req, res) => {
//   try {
//     const { subscriptionId } = req.params;
//     const { status } = req.body;
//     let { classStartTime, classEndTime } = req.body;

//     const condition = {
//       _id: subscriptionId,
//     };
//     let update = {
//       status: status,
//     };
//     let options = {
//       new: true,
//     };

//     // Calculate course duration and set start and end dates
//     const durationResult = await SubscriptionModel.calculateCourseDuration(
//       req.body.courseId
//     );

//     if (durationResult.status === "SUCCESS") {
//       const dateNow = zeroSetter(Date.now(), "time");
//       const endDate = moment(dateNow).add(
//         durationResult.data,
//         "milliseconds"
//       );
//       update.startDate = dateNow;
//       update.endDate = endDate.toDate();
//     } else {
//       return res.status(500).json({
//         message: "Failed to calculate course duration.",
//       });
//     }

//     if (status === "active") {
//       // Check if the slot is available
//       const isSlotAvailable = await SubscriptionModel.checkTimeSlotAvailability(
//         req.body.courseId,
//         classStartTime,
//         classEndTime
//       );

//       if (!isSlotAvailable) {
//         return res.status(404).send({
//           message: "FAILED",
//           description: "Slot has been taken",
//           error: isSlotAvailable.error,
//         });
//       }
//     }

//     // Update the subscription
//     const updateResult = await SubscriptionModel.updateSubscription(
//       condition,
//       update,
//       options
//     );

//     if (updateResult.status === "SUCCESS") {
//       return res.status(200).json({
//         message: "SUCCESS",
//         data: updateResult.data,
//       });
//     } else {
//       return res.status(500).json({
//         message: "FAILED",
//         description: "Subscription not updated",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Internal server error.",
//     });
//   }
// };

