const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
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
      enum:['MALE','FEMALE','OTHER']
    },
    role: {
      type: String,
      required: true,
      uppercase:true,
      enum: ["STUDENT", "TEACHER", "ADMIN"],
    },
    profile: {
      type: String,
      default:
        "https://www.google.com/search?client=firefox-b-d&q=defualt+logo#vhid=hiaeBBk4UEpQUM&vssid=l",
    },
    session: {
      type: String,
      default: null,
    },
    experience: { 
      type:String,
    },
   
    isVerified: Boolean,
  },
 
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
