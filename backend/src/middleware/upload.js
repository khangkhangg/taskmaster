const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  './uploads',
  './uploads/tasks',
  './uploads/profiles',
  './uploads/disputes',
  './uploads/portfolio',
  './uploads/documents'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = './uploads/';

    // Determine upload path based on field name or route
    if (req.baseUrl.includes('/tasks')) {
      uploadPath += 'tasks/';
    } else if (req.baseUrl.includes('/users') || req.baseUrl.includes('/profile')) {
      uploadPath += 'profiles/';
    } else if (req.baseUrl.includes('/disputes')) {
      uploadPath += 'disputes/';
    } else if (file.fieldname === 'portfolio') {
      uploadPath += 'portfolio/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  // Allowed image extensions
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed document extensions
  const documentTypes = /pdf|doc|docx|txt/;

  const extname = path.extname(file.originalname).toLowerCase();
  const ext = extname.substring(1); // Remove the dot

  const isImage = imageTypes.test(ext);
  const isDocument = documentTypes.test(ext);

  if (isImage || isDocument) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, JPG, PNG, GIF, WEBP) and documents (PDF, DOC, DOCX, TXT) are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: `Too many files. Maximum is ${maxCount}.` });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file URL
const getFileUrl = (req, filename) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileUrl
};
