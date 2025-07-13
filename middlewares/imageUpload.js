const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const resizeHouseImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadDir = path.join(__dirname, "../uploads/houses");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `house-${Date.now()}.jpeg`;
    const filepath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(800, 600)
      .jpeg({ quality: 80 })
      .toFile(filepath);

    req.body.imageUrl = `/uploads/houses/${filename}`;
    next();
  } catch (err) {
    res.status(500).json({ message: "Image processing failed" });
  }
};

module.exports = { upload, resizeHouseImage };
