
import express from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { QueueService } from '../services/QueueService';

const router = express.Router();

// Get all print jobs
router.get('/jobs', async (req, res) => {
  try {
    const db = req.app.locals.databaseService as DatabaseService;
    const jobs = await db.getAllPrintJobs();
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching print jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch print jobs' });
  }
});

// Get print job by ID
router.get('/jobs/:id', async (req, res) => {
  try {
    const db = req.app.locals.databaseService as DatabaseService;
    const job = await db.getPrintJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching print job:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch print job' });
  }
});

// Get jobs by phone number
router.get('/jobs/phone/:phoneNumber', async (req, res) => {
  try {
    const db = req.app.locals.databaseService as DatabaseService;
    const jobs = await db.getPrintJobsByPhone(req.params.phoneNumber);
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs by phone:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// Create new print job
router.post('/jobs', async (req, res) => {
  try {
    const { studentName, phoneNumber, fileName, fileUrl, pages, cost } = req.body;
    
    if (!studentName || !phoneNumber || !fileName || !fileUrl || !pages || !cost) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const jobId = `job_${Date.now()}`;
    const estimatedTime = Math.max(2, Math.ceil(pages / 10)); // Estimate 2-5 minutes

    const job = {
      id: jobId,
      studentName,
      phoneNumber,
      fileName,
      fileUrl,
      pages,
      cost,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      estimatedTime,
      progress: 0
    };

    const db = req.app.locals.databaseService as DatabaseService;
    await db.createPrintJob(job);

    res.json({ success: true, jobId, job });
  } catch (error) {
    console.error('Error creating print job:', error);
    res.status(500).json({ success: false, error: 'Failed to create print job' });
  }
});

// Update print job status
router.patch('/jobs/:id/status', async (req, res) => {
  try {
    const { status, progress } = req.body;
    
    const db = req.app.locals.databaseService as DatabaseService;
    await db.updatePrintJob(req.params.id, { status, progress });
    
    const updatedJob = await db.getPrintJob(req.params.id);
    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, error: 'Failed to update job status' });
  }
});

// Start printing a job
router.post('/jobs/:id/print', async (req, res) => {
  try {
    const jobId = req.params.id;
    const db = req.app.locals.databaseService as DatabaseService;
    const queue = req.app.locals.queueService as QueueService;
    
    const job = await db.getPrintJob(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // Add to print queue
    await queue.addPrintJob(jobId);
    
    res.json({ success: true, message: 'Job added to print queue' });
  } catch (error) {
    console.error('Error starting print job:', error);
    res.status(500).json({ success: false, error: 'Failed to start print job' });
  }
});

// Cancel print job
router.delete('/jobs/:id', async (req, res) => {
  try {
    const db = req.app.locals.databaseService as DatabaseService;
    await db.updatePrintJob(req.params.id, { 
      status: 'cancelled',
      progress: 0 
    });
    
    res.json({ success: true, message: 'Job cancelled' });
  } catch (error) {
    console.error('Error cancelling print job:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel print job' });
  }
});

// Get queue status
router.get('/queue', async (req, res) => {
  try {
    const queue = req.app.locals.queueService as QueueService;
    const stats = await queue.getQueueStats();
    const currentQueue = await queue.getCurrentQueue();
    const activeJobs = await queue.getActiveJobs();
    
    res.json({ 
      success: true, 
      stats,
      queue: currentQueue,
      active: activeJobs
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch queue status' });
  }
});

export default router;
