
import express from 'express';
import { FileService } from '../services/FileService';
import { DatabaseService } from '../services/DatabaseService';
import { QueueService } from '../services/QueueService';

const router = express.Router();

// File upload endpoint
router.post('/upload', async (req, res) => {
  try {
    const fileService = req.app.locals.fileService as FileService;
    const upload = fileService.getMulterUpload().single('file');
    
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      try {
        // Process the uploaded file
        const result = await fileService.processFile(req.file.path, req.file.originalname);
        
        res.json({ 
          success: true, 
          file: result 
        });
      } catch (processError) {
        console.error('File processing error:', processError);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to process file' 
        });
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

// Process WhatsApp file
router.post('/process-whatsapp', async (req, res) => {
  try {
    const { fileUrl, phoneNumber, studentName } = req.body;
    
    if (!fileUrl || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Download file from WhatsApp media URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const buffer = await response.arrayBuffer();
    const fileName = `whatsapp_${Date.now()}.pdf`;
    const filePath = `./uploads/${fileName}`;
    
    // Save file
    const fs = require('fs');
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Process file
    const fileService = req.app.locals.fileService as FileService;
    const result = await fileService.processFile(filePath, fileName);

    // Create print job
    const jobId = `job_${Date.now()}`;
    const estimatedTime = Math.max(2, Math.ceil(result.pages / 10));

    const job = {
      id: jobId,
      studentName: studentName || `Student ${phoneNumber.slice(-4)}`,
      phoneNumber,
      fileName: result.fileName,
      fileUrl: result.fileUrl,
      pages: result.pages,
      cost: result.cost,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      estimatedTime,
      progress: 0
    };

    const db = req.app.locals.databaseService as DatabaseService;
    await db.createPrintJob(job);

    res.json({ 
      success: true, 
      jobId,
      file: result,
      job 
    });
  } catch (error) {
    console.error('WhatsApp file processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process WhatsApp file' 
    });
  }
});

// Get file info
router.get('/info/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join('./uploads', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }

    const stats = fs.statSync(filePath);
    
    res.json({ 
      success: true, 
      file: {
        name: fileName,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      }
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ success: false, error: 'Failed to get file info' });
  }
});

// Delete file
router.delete('/:fileName', async (req, res) => {
  try {
    const fileService = req.app.locals.fileService as FileService;
    await fileService.deleteFile(`/uploads/${req.params.fileName}`);
    
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

// Cleanup old files
router.post('/cleanup', async (req, res) => {
  try {
    const fileService = req.app.locals.fileService as FileService;
    const hours = req.body.hours || 24;
    
    await fileService.cleanupOldFiles(hours);
    
    res.json({ success: true, message: `Cleaned up files older than ${hours} hours` });
  } catch (error) {
    console.error('File cleanup error:', error);
    res.status(500).json({ success: false, error: 'Failed to cleanup files' });
  }
});

export default router;
