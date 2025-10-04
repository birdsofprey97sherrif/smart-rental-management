const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Removed duplicate multer configuration to avoid redeclaration errors.

// Install: npm install multer sharp file-type
const multer = require('multer');
const sharp = require('sharp');
const FileType = require('file-type');

const storage = multer.memoryStorage();

const fileFilter = async (req, file, cb) => {
  try {
    // Check file type from buffer
    const fileType = await FileType.fromBuffer(file.buffer);
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (!fileType || !allowedTypes.includes(fileType.mime)) {
      return cb(new Error('Only images are allowed'), false);
    }
    
    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter
});

// Process and sanitize images
exports.processImage = async (req, res, next) => {
  if (!req.file) return next();

  const filename = `house-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
  
  await sharp(req.file.buffer)
    .resize(1200, 900, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toFile(`uploads/${filename}`);

  req.body.photo = filename;
  next();
};
module.exports = upload;
