const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "cartiq-products" },
      (error, result) => {

        if (error) {
          console.log("Cloudinary error:", error);
          return res.status(500).json({
            message: "Cloudinary upload failed"
          });
        }

        res.json({
          imageUrl: result.secure_url
        });

      }
    );

    stream.end(req.file.buffer);

  } catch (error) {

    console.log("Server upload error:", error);

    res.status(500).json({
      message: "Upload failed"
    });

  }

});

module.exports = router;