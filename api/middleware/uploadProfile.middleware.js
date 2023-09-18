const multer = require("multer");
const fs = require("fs");

// Define storage using multer.diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { generatedId, role } = req;

    // Define destination directory based on the user's role and generatedId
    let destination;
    switch (role) {
      case "STUDENT":
        destination = `public/${generatedId}`;
        break;
      case "TEACHER":
        destination = `public/${generatedId}`;
        break;
      case "ADMIN":
        destination = `public/${generatedId}`;
        break;
      default:
        destination = `public/unknown/${generatedId}`;
    }

    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    cb(null, destination);
  },
  filename: (req, file, cb) => {
    try {
      const { generatedId } = req;

      const fullFilePath = `./public/${req.body.role}/${generatedId}/${file.originalname}`;

      if (fs.existsSync(fullFilePath)) {
        fs.unlinkSync(fullFilePath);
      }

      req.filename = `${file.originalname}`;

      let filename = req.filename;

      req.fullFilePath = fullFilePath;

      cb(null, filename);
    } catch (error) {
      console.error(`Error in ${req.body.role} profile upload`, error);

      cb(new Error("Error occurred"));
    }
  },
});

// Define file size limits (1MB in this example)
const limits = {
  fileSize: 1024 * 1024, // 1MB
};

// Define file filter function to allow only specific file types (e.g., jpg, png, svg)
const fileFilter = (allowedFileTypes) => (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new multer.MulterError("UNSUPPORTED_FILE_TYPE", "userProfile");
    error.message = "Only jpg, png & svg file types are supported";
    cb(error);
  }
};

// Create the multer upload middleware
const upload = multer({ storage, limits, fileFilter: fileFilter(["image/jpeg", "image/png", "image/svg+xml"]) }).single("userProfile");

module.exports = upload;

