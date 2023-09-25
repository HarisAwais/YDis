const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          enum: [1, 2, 3, 4, 5],
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],

    fee: {
      type: Number,
      required: true,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },

    stripeProduct:{
      productId: {
        type: String,
      },
      productPrice:{
        type:String,
      }
    },
    
    courseOutline: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },

        topics: [
          {
            title: {
              type: String,
              required: true, 
            },

            isCompleted:{
              type:Boolean,
              default:false,
            }

          },

        ],
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, _id: true }
);


const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
