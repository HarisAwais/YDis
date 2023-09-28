const JWT = require("jsonwebtoken");
const UserModel = require("../model/user.model");
const JWT_SECRET = process.env.JWT_SECRET;

const authentication = async (req, res, next) => {
  const bearerToken = req.headers.authorization;


  const token = bearerToken?.split(" ")[1];


  let decodedToken;
  let isSessionMatched;
  try {
    decodedToken = JWT.verify(token, JWT_SECRET);
    // console.log("Decoded Token:", decodedToken);

    req.decodedToken = decodedToken; // Set the decoded token in the req object
    req.role = decodedToken.role;

    const userFound = await UserModel.getUserById(decodedToken._id);
    isSessionMatched = userFound.data?.session === decodedToken.session;

    // console.log(req.decodedToken); // Now this should work
    // console.log(isSessionMatched);
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      message: "INVALID USER",
    });
  }

  if (decodedToken && isSessionMatched) {
    next();
  } else {
    return res.status(404).json({
      message: "INVALID USER",
    });
  }
};

module.exports = {
  authentication,
};
