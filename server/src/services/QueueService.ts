
import Queue from 'bull';
import { DatabaseService, PrintJob } from './DatabaseService';
import { PrinterService } from './PrinterService';
import { WhatsAppService } from './WhatsAppService';
import { FileService } from './FileService';

export interface QueueJobData {
  jobId: string;
  action: 'process' | 'print' | 'notify';
  data?: any;
}

export class QueueService {
  private printQueue: Queue.Queue<QueueJobData>;
  private databaseService: DatabaseService;
  private printerService: PrinterService;
  private whatsappService: WhatsAppService;
  private fileService: FileService;
  private updateCallbacks: ((data: any) => void)[] = [];

  constructor() {
    // Initialize Bull queue with Redis
    this.printQueue = new Queue('print queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 3
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    this.setupProcessors();
    this.setupEventHandlers();
    
    console.log('✅ Queue service initialized');
  }

  setServices(db: DatabaseService, printer: PrinterService, whatsapp: WhatsAppService, fileService: FileService) {
    this.databaseService = db;
    this.printerService = printer;
    this.whatsappService = whatsapp;
    this.fileService = fileService;
  }

  private setupProcessors() {
    // Process different types of jobs
    this.printQueue.process('process-file', 5, async (job) => {
      return await this.processFileJob(job.data);
    });

    this.printQueue.process('print-job', 1, async (job) => {
      return await this.processPrintJob(job.data);
    });

    this.printQueue.process('notify-user', 10, async (job) => {
      return await this.processNotificationJob(job.data);
    });
  }

  private setupEventHandlers() {
    this.printQueue.on('completed', (job) => {
      console.log(`✅ Job completed: ${job.id}`);
      this.broadcastUpdate();
    });

    this.printQueue.on('failed', (job, err) => {
      console.error(`❌ Job failed: ${job.id}`, err.message);
      this.broadcastUpdate();
    });

    this.printQueue.on('progress', (job, progress) => {
      console.log(`📊 Job progress: ${job.id} - ${progress}%`);
      this.broadcastUpdate();
    });
  }

  // Add file processing job
  async addFileProcessingJob(jobId: string, filePath: string, phoneNumber: string): Promise<void> {
    await this.printQueue.add('process-file', {
      jobId,
      action: 'process',
      data: { filePath, phoneNumber }
    }, {
      priority: 10,
      delay: 0
    });
    
    console.log(`📋 File processing job added: ${jobId}`);
  }

  // Add print job to queue
  async addPrintJob(jobId: string): Promise<void> {
    await this.printQueue.add('print-job', {
      jobId,
      action: 'print'
    }, {
      priority: 5,
      delay: 0
    });
    
    console.log(`🖨️ Print job added to queue: ${jobId}`);
    this.broadcastUpdate();
  }

  // Add notification job
  async addNotificationJob(phoneNumber: string, message: string, delay: number = 0): Promise<void> {
    await this.printQueue.add('notify-user', {
      jobId: Date.now().toString(),
      action: 'notify',
      data: { phoneNumber, message }
    }, {
      priority: 1,
      delay
    });
  }

  private async processFileJob(jobData: QueueJobData): Promise<any> {
    const { jobId, data } = jobData;
    const { filePath, phoneNumber } = data;

    try {
      // Update job status
      await this.databaseService.updatePrintJob(jobId, {
        status: 'processing',
        progress: 10
      });

      // Process the file
      const fileResult = await this.fileService.processFile(filePath, data.originalName || 'document');
      
      // Update job with file processing results
      await this.databaseService.updatePrintJob(jobId, {
        pages: fileResult.pages,
        cost: fileResult.cost,
        fileUrl: fileResult.fileUrl,
        progress: 50
      });

      // Send quote to user via WhatsApp
      const message = `📄 *Print Quote Ready*\n\n` +
        `File: ${fileResult.fileName}\n` +
        `Pages: ${fileResult.pages}\n` +
        `Cost: ₹${fileResult.cost}\n\n` +
        `Reply "confirm" to proceed with payment\n` +
        `Reply "cancel" to cancel this job\n\n` +
        `⏱️ Quote valid for 30 minutes`;

      await this.whatsappService.sendMessage(phoneNumber, message);

      await this.databaseService.updatePrintJob(jobId, {
        status: 'pending',
        progress: 100
      });

      return { success: true, fileResult };
    } catch (error) {
      console.error(`❌ File processing failed for job ${jobId}:`, error);
      
      await this.databaseService.updatePrintJob(jobId, {
        status: 'failed',
        progress: 0
      });

      // Notify user of failure
      await this.whatsappService.sendMessage(
        phoneNumber,
        `❌ Sorry, there was an error processing your file. Please try again or contact support.`
      );

      throw error;
    }
  }

  private async processPrintJob(jobData: QueueJobData): Promise<any> {
    const { jobId } = jobData;

    try {
      // Get job details
      const job = await this.databaseService.getPrintJob(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Update status to printing
      await this.databaseService.updatePrintJob(jobId, {
        status: 'printing',
        progress: 10
      });

      // Notify user that printing started
      await this.whatsappService.sendMessage(
        job.phoneNumber,
        `🖨️ *Printing Started*\n\n` +
        `Your document is now being printed!\n` +
        `Estimated time: ${job.estimatedTime} minutes\n\n` +
        `You'll receive an update when it's ready for collection.`
      );

      // Convert file path for printing
      let printFilePath = job.fileUrl;
      if (job.fileUrl.startsWith('/uploads/')) {
        printFilePath = './uploads/' + job.fileUrl.replace('/uploads/', '');
      }

      // Convert image to PDF if needed
      if (printFilePath.match(/\.(jpg|jpeg|png|webp)$/i)) {
        printFilePath = await this.fileService.convertImageToPDF(printFilePath);
      }

      // Update progress
      await this.databaseService.updatePrintJob(jobId, { progress: 50 });

      // Send to printer
      const printResult = await this.printerService.printFile(printFilePath, {
        copies: 1,
        color: false,
        paperSize: 'A4'
      });

      if (!printResult.success) {
        throw new Error(printResult.error || 'Print failed');
      }

      // Simulate printing time (in real scenario, this would be actual print monitoring)
      await this.simulatePrintProgress(jobId, job.estimatedTime);

      // Mark as completed
      await this.databaseService.updatePrintJob(jobId, {
        status: 'completed',
        progress: 100
      });

      // Notify user of completion
      await this.whatsappService.sendMessage(
        job.phoneNumber,
        `✅ *Print Job Completed!*\n\n` +
        `Your document is ready for collection.\n` +
        `Please collect it from the print station.\n\n` +
        `Thank you for using AutoPrint! 🎓`
      );

      return { success: true };
    } catch (error) {
      console.error(`❌ Print job failed for ${jobId}:`, error);
      
      const job = await this.databaseService.getPrintJob(jobId);
      if (job) {
        await this.databaseService.updatePrintJob(jobId, {
          status: 'failed',
          progress: 0
        });

        await this.whatsappService.sendMessage(
          job.phoneNumber,
          `❌ *Print Job Failed*\n\n` +
          `There was an error printing your document.\n` +
          `Please contact support for assistance.\n\n` +
          `Your payment will be refunded if applicable.`
        );
      }

      throw error;
    }
  }

  private async processNotificationJob(jobData: QueueJobData): Promise<any> {
    const { data } = jobData;
    const { phoneNumber, message } = data;

    try {
      await this.whatsappService.sendMessage(phoneNumber, message);
      return { success: true };
    } catch (error) {
      console.error('❌ Notification job failed:', error);
      throw error;
    }
  }

  private async simulatePrintProgress(jobId: string, estimatedMinutes: number): Promise<void> {
    const steps = 5;
    const stepDelay = (estimatedMinutes * 60 * 1000) / steps; // Convert to milliseconds

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      const progress = 50 + (i * 10); // Start from 50% and go to 100%
      await this.databaseService.updatePrintJob(jobId, { progress });
      this.broadcastUpdate();
    }
  }

  // Get queue statistics
  async getQueueStats(): Promise<any> {
    const waiting = await this.printQueue.getWaiting();
    const active = await this.printQueue.getActive();
    const completed = await this.printQueue.getCompleted();
    const failed = await this.printQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length
    };
  }

  // Get current queue
  async getCurrentQueue(): Promise<PrintJob[]> {
    if (!this.databaseService) return [];
    
    return await this.databaseService.getPrintJobsByStatus('pending');
  }

  // Get active jobs
  async getActiveJobs(): Promise<PrintJob[]> {
    if (!this.databaseService) return [];
    
    return await this.databaseService.getPrintJobsByStatus('printing');
  }

  onUpdate(callback: (data: any) => void) {
    this.updateCallbacks.push(callback);
  }

  private broadcastUpdate() {
    this.updateCallbacks.forEach(callback => {
      callback({ timestamp: new Date(), type: 'queue_update' });
    });
  }

  isReady(): boolean {
    return this.printQueue !== null;
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down queue service...');
    if (this.printQueue) {
      await this.printQueue.close();
    }
  }
}
