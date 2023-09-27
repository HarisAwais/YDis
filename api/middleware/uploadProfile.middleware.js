// Importing Modules
const multer = require("multer");
const fs = require("fs");

// Multer Functions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { generatedId } = req;
    const { role } = req.body; // Access role from the request body

    cb(
      null,
      /* 
        If role exists in req.body and is "STUDENT," then it will be "STUDENT"
        otherwise, it will be "TEACHER"
      */
      `public/${role === "STUDENT" ? "STUDENT" : "TEACHER"}/` +
        generatedId +
        "/"
    );
  },
  filename: (req, file, cb) => {
    try {
      const { generatedId } = req;
      const { role } = req.body; // Access role from the request body

      // Create a file path where we have to store the file
      const fullFilePath = `./public/${
        // see the comment in destination field for the line below
        role === "STUDENT" ? "STUDENT" : "TEACHER"
      }/${generatedId}/${file.originalname}`;

      // If file exists in the given path, then delete the file
      if (fs.existsSync(fullFilePath)) {
        fs.unlinkSync(fullFilePath);
      }

      // Create the directory, in case if the directory does not exist
      fs.mkdirSync(
        // see the comment in destination field for the line below
        `public/${role === "STUDENT" ? "STUDENT" : "TEACHER"}/` +
          generatedId +
          "/",
        { recursive: true }
      );

      req.filename = `${file.originalname}`;

      let filename = req.filename;

      req.fullFilePath = fullFilePath;

      cb(null, filename);
    } catch (error) {
      console.error(
        `error in ${role === "STUDENT" ? "STUDENT" : "TEACHER"} profile upload`,
        error
      );

      cb(new Error("Error occurred"));
    }
  },
});

const limits = {
  fileSize: 1024 * 1024, // 1MB
};

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/png", "image/svg+xml"];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Create a Multer Error and pass it to cb to catch it in the Multer Error Handler
    const error = new multer.MulterError(
      "UNSUPPORTED_FILE_TYPE",
      "userProfile"
    );
    error.message = "Only jpg, png & svg file type are supported";
    cb(error);
  }
};

// Initializing Multer
const upload = multer({ storage, limits, fileFilter }).single("userProfile");

// For Handling Multer Errors/ Multer Error Handler
const uploadProfile = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      // Check if the error is from Multer or not
      if (error instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ status: "FAILED", description: "Multer: " + error.message });
      } else {
        // Default Internal Server Error
        return res.status(500).json({
          status: "INTERNAL_SERVER_ERROR",
          message: "SORRY: Something went wrong",
        });
      }
    }

    next();
  });
};

module.exports = uploadProfile;
