const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    _courseId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    _studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    classStartTime: {
      type: Date,
      required: true,
    },
    classEndTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      uppercase: true,
      default: "PENDING",
      enum: ["PENDING", "COMPLETED", "ACTIVE"],
      required: true,
    },
    completedTopic:[{
      title: String, 
      completed: Boolean, 
    },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
