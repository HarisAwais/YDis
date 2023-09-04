// Importing Modules
const multer = require("multer");
const fs = require("fs");

// Multer Functions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { generatedId } = req;
    // console.log(req.generatedId)

    // Determine the directory based on file type (image or PDF)
    const directory = file.mimetype.startsWith('image/') ? 'images' : 'pdfs';

    cb(
      null,
      // Specify the destination directory based on file type
      `public/${directory}/${generatedId}/`
    );
  },
  filename: (req, file, cb) => {
    try {
      const { generatedId } = req;
    

      // Create a file path where we have to store the file
      const fullFilePath = `./public/${
        // Determine the directory based on file type
        file.mimetype.startsWith('image/') ? 'images' : 'pdfs'
      }/${generatedId}/${file.originalname}`;

      // If file exists in the given path, then delete the file
      if (fs.existsSync(fullFilePath)) {
        fs.unlinkSync(fullFilePath);
      }

      // Create the directory, in case if it doesn't exist
      fs.mkdirSync(
        `public/${
          // Determine the directory based on file type
          file.mimetype.startsWith('image/') ? 'images' : 'pdfs'
        }/${generatedId}/`,
        { recursive: true }
      );

      req.filename = `${file.originalname}`;

      let filename = req.filename;

      req.fullFilePath = fullFilePath;

      cb(null, filename);
    } catch (error) {
      console.error(
        `error in ${
          file.mimetype.startsWith('image/') ? 'images' : 'pdfs'
        } file upload`,
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
  // Define allowed file types for both images and PDFs
  const allowedImageTypes = ["image/jpeg", "image/png", "image/svg+xml"];
  const allowedPdfTypes = ["application/pdf"];

  // Determine the allowed file types based on the file's mimetype
  const allowedFileTypes = file.mimetype.startsWith('image/')
    ? allowedImageTypes
    : allowedPdfTypes;

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Create Multer Error and pass it to cb to catch it in Multer Error Handler
    const error = new multer.MulterError(
      "UNSUPPORTED_FILE_TYPE",
      "fileUpload"
    );
    error.message = "Only jpg, png, svg & pdf file types are supported";
    cb(error);
  }
};

// Initializing Multer
const upload = multer({ storage, limits, fileFilter }).single("userProfile");

// For Handling Multer Errors/ Multer Error Handler
const uploadFiles = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      // Check error is from Multer or not
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

module.exports = uploadFiles;
