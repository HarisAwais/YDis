const mongoose = require("mongoose");

const generateId = async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId();
  req.generatedId = userId.toString();
  // console.log(generateId)
  // console.log("From genrateId: userId:", req.generatedId);
  next();
};

module.exports = { generateId };
