const mongoose = require("mongoose");
const { USER_ROLE,GENDER,PROFILE } = require("../../config/constant");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender:{
      type:String,
      required:true,
      enum: [GENDER.MALE, GENDER.FEMALE, GENDER.OTHER], 

    },
    role: {
      type: String,
      required: true,
      uppercase:true,
      enum: [USER_ROLE.STUDENT,USER_ROLE.TEACHER,USER_ROLE.ADMIN],
    },
    profile: {
      type: String,
      default:PROFILE
    },
    session: {
      type: String,
      default: null,
    },
    experience: { 
      type:String,
      default:null
    },
    isVerified: Boolean,
    stripeAccountId:{type:String,default:null}
  },
  {timestamps: true,_id:true}
);

const User = mongoose.model("User", userSchema);

module.exports = User;
