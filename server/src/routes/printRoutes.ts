
import express from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { QueueService } from '../services/QueueService';

const router = express.Router();

// Get all print jobs
router.get('/jobs', async (req, res) => {
  try {
    const databaseService = req.app.locals.databaseService as DatabaseService;
    const jobs = await databaseService.getAllPrintJobs();
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Failed to get print jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve print jobs' });
  }
});

// Get print job by ID
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const databaseService = req.app.locals.databaseService as DatabaseService;
    const job = await databaseService.getPrintJob(id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Print job not found' });
    }
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Failed to get print job:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve print job' });
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
        error: 'Missing required fields: studentName, phoneNumber, fileName, fileUrl, pages, cost' 
      });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const estimatedTime = Math.ceil(pages * 1.2); // 1.2 minutes per page

    const printJob = {
      id: jobId,
      studentName,
      phoneNumber,
      fileName,
      fileUrl,
      pages: parseInt(pages),
      cost: parseFloat(cost),
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      estimatedTime,
      progress: 0
    };

    const databaseService = req.app.locals.databaseService as DatabaseService;
    const wsService = req.app.locals.wsService;

    // Save to database
    await databaseService.createPrintJob(printJob);

    // Broadcast new job to WebSocket clients
    if (wsService) {
      wsService.broadcast('newJob', printJob);
    }

    res.json({ success: true, jobId, job: printJob });
  } catch (error) {
    console.error('Failed to create print job:', error);
    res.status(500).json({ success: false, error: 'Failed to create print job' });
  }
});

// Update print job status
router.patch('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, paymentStatus, transactionId } = req.body;
    
    const databaseService = req.app.locals.databaseService as DatabaseService;
    const wsService = req.app.locals.wsService;
    const queueService = req.app.locals.queueService as QueueService;

    // Validate job exists
    const existingJob = await databaseService.getPrintJob(id);
    if (!existingJob) {
      return res.status(404).json({ success: false, error: 'Print job not found' });
    }

    // Update job
    const updates: any = {};
    if (status) updates.status = status;
    if (progress !== undefined) updates.progress = progress;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (transactionId) updates.transactionId = transactionId;

    await databaseService.updatePrintJob(id, updates);

    // If payment confirmed, add to print queue
    if (paymentStatus === 'paid' && existingJob.status === 'pending') {
      await queueService.addPrintJob(id);
    }

    // Get updated job
    const updatedJob = await databaseService.getPrintJob(id);

    // Broadcast update
    if (wsService) {
      wsService.broadcast('jobUpdate', updatedJob);
    }

    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Failed to update print job:', error);
    res.status(500).json({ success: false, error: 'Failed to update print job' });
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
