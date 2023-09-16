const mongoose = require("mongoose");

const generateId = () => {
  return new mongoose.Types.ObjectId();
};

module.exports = { generateId };
