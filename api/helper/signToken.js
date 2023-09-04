const JWT = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = async (user) => {
  const tokenData = {
    _id: user._id,
    role: user.role,
    session:user.session
  };

  const expiresIn = "7d"; 

  const signedToken = JWT.sign(tokenData, JWT_SECRET, { expiresIn });
  return signedToken;
};

module.exports = {
  signToken,
};
