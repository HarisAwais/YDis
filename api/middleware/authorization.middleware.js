const isTeacher = (req, res, next) => {
  const { role } = req.decodedToken;
  // console.log(req.decodedToken)

  if (role === "TEACHER") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

const isStudent = (req, res, next) => {
  const { role } = req.decodedToken;

  if (role === "STUDENT") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

const isAdmin = (req, res, next) => {
  const { role } = req.decodedToken;

  if (role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};

module.exports = { isTeacher, isStudent, isAdmin };
