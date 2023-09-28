const mongoose = require("mongoose");
const { STATUS, PAYMENT } = require("../../config/constant");

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
      default: STATUS.PENDING,
      enum: [STATUS.PENDING,STATUS.APPROVED,STATUS.COMPLETE],
      required: true,
    },
    courseStat: [
      {
        moduleId: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        topics: [
          {
            topicId: {
              type: mongoose.Types.ObjectId,
              required: true,
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    stripeAccount: {
      paymentIntentId: String, 
      subscriptionStartDate: Date,
      subscriptionEndDate: Date, 
      subscriptionCreationDate: Date,
      paymentStatus: {
        type: String,
        uppercase: true,
        enum: [PAYMENT.PENDING, PAYMENT.PAID], 
        default: PAYMENT.PENDING, 
      },

    },  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
