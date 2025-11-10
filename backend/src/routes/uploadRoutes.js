const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, deleteFile, getFileUrl } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const path = require('path');

// Apply rate limiting to all upload routes
router.use(auth);
router.use(uploadLimiter);

// Upload single image (avatar, profile image)
router.post('/image', uploadSingle('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Upload multiple images (task images, portfolio)
router.post('/images', uploadMultiple('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      url: getFileUrl(req, file.filename),
      path: file.path
    }));

    res.json({
      message: `${files.length} file(s) uploaded successfully`,
      files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
});

// Upload document
router.post('/document', uploadSingle('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);

    res.json({
      message: 'Document uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Delete file
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    const deleted = deleteFile(filePath);

    if (deleted) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;
