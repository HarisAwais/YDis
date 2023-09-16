const mongoose = require("mongoose");

const generateId = async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId();
  req.generatedId = userId.toString();
  next();
};

module.exports = { generateId };
