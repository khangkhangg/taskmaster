const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const { exportUserDataJSON, exportUserDataCSV, exportPlatformAnalytics, getExportFile } = require('../services/exportService');
const path = require('path');

// Export user's own data (GDPR compliance)
router.post('/my-data/json', auth, async (req, res) => {
  try {
    const result = await exportUserDataJSON(req.userId);

    if (result.success) {
      res.json({
        message: 'Data export created successfully',
        filename: result.filename,
        size: result.size,
        downloadUrl: `/api/export/download/${result.filename}`
      });
    } else {
      res.status(500).json({ message: 'Export failed', error: result.error });
    }
  } catch (error) {
    console.error('Export my data JSON error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/my-data/csv', auth, async (req, res) => {
  try {
    const result = await exportUserDataCSV(req.userId);

    if (result.success) {
      res.json({
        message: 'Data export created successfully',
        filename: result.filename,
        size: result.size,
        downloadUrl: `/api/export/download/${result.filename}`
      });
    } else {
      res.status(500).json({ message: 'Export failed', error: result.error });
    }
  } catch (error) {
    console.error('Export my data CSV error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export platform analytics (admin only)
router.post('/platform-analytics', auth, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const result = await exportPlatformAnalytics(startDate, endDate);

    if (result.success) {
      res.json({
        message: 'Platform analytics export created successfully',
        filename: result.filename,
        size: result.size,
        downloadUrl: `/api/export/download/${result.filename}`
      });
    } else {
      res.status(500).json({ message: 'Export failed', error: result.error });
    }
  } catch (error) {
    console.error('Export platform analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download export file
router.get('/download/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const result = getExportFile(filename);

    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }

    // Send file for download
    res.download(result.filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Download export error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
