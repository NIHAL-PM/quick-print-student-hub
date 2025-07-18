
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { DatabaseService } from './services/DatabaseService';
import { WhatsAppService } from './services/WhatsAppService';
import { PrinterService } from './services/PrinterService';
import { PaymentService } from './services/PaymentService';
import { FileService } from './services/FileService';
import { WebSocketService } from './services/WebSocketService';
import { QueueService } from './services/QueueService';

import printRoutes from './routes/printRoutes';
import fileRoutes from './routes/fileRoutes';
import paymentRoutes from './routes/paymentRoutes';
import whatsappRoutes from './routes/whatsappRoutes';

// Load environment variables
dotenv.config();

class AutoPrintServer {
  private app: express.Application;
  private server: any;
  private wsServer: WebSocketServer;
  private port: number;

  // Services
  private databaseService: DatabaseService;
  private whatsappService: WhatsAppService;
  private printerService: PrinterService;
  private paymentService: PaymentService;
  private fileService: FileService;
  private wsService: WebSocketService;
  private queueService: QueueService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    
    this.initializeDirectories();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private initializeDirectories() {
    const dirs = [
      './data',
      './uploads',
      './whatsapp-session',
      './logs'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async initializeServices() {
    try {
      console.log('🔄 Initializing services...');
      
      // Initialize database first
      this.databaseService = new DatabaseService();
      await this.databaseService.initialize();

      // Initialize file service
      this.fileService = new FileService();
      
      // Initialize printer service
      this.printerService = new PrinterService();
      
      // Initialize payment service
      this.paymentService = new PaymentService();
      
      // Initialize queue service with dependencies
      this.queueService = new QueueService();
      this.queueService.setServices(
        this.databaseService,
        this.printerService,
        null, // WhatsApp service will be set later
        this.fileService
      );
      
      // Initialize WhatsApp service
      this.whatsappService = new WhatsAppService();
      
      // Set WhatsApp service in queue service
      this.queueService.setServices(
        this.databaseService,
        this.printerService,
        this.whatsappService,
        this.fileService
      );

      // Set up service locals for routes
      this.app.locals.databaseService = this.databaseService;
      this.app.locals.fileService = this.fileService;
      this.app.locals.printerService = this.printerService;
      this.app.locals.paymentService = this.paymentService;
      this.app.locals.queueService = this.queueService;
      this.app.locals.whatsappService = this.whatsappService;
      
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Serve uploaded files
    this.app.use('/uploads', express.static('uploads'));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: this.databaseService.isConnected(),
          whatsapp: this.whatsappService.isConnected(),
          printer: this.printerService.isReady(),
          queue: this.queueService.isReady()
        }
      });
    });

    // API routes
    this.app.use('/api/print', printRoutes);
    this.app.use('/api/files', fileRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/whatsapp', whatsappRoutes);

    // Error handling
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    });
  }

  private setupWebSocket() {
    this.server = createServer(this.app);
    this.wsServer = new WebSocketServer({ 
      server: this.server,
      path: '/ws'
    });

    this.wsService = new WebSocketService(this.wsServer);
    this.app.locals.wsService = this.wsService;
  }

  public async start() {
    try {
      // Setup WebSocket first
      this.setupWebSocket();
      
      // Initialize all services
      await this.initializeServices();
      
      // Set up service event handlers
      this.setupServiceHandlers();
      
      // Start WhatsApp service (async - will connect in background)
      this.whatsappService.initialize().catch(err => {
        console.error('⚠️ WhatsApp service initialization failed:', err);
      });
      
      // Start the server
      this.server.listen(this.port, () => {
        console.log(`🚀 AutoPrint Server running on port ${this.port}`);
        console.log(`📱 WhatsApp Web: ${this.whatsappService.isConnected() ? 'Connected' : 'Connecting...'}`);
        console.log(`🖨️  Printer service: ${this.printerService.isReady() ? 'Ready' : 'Initializing...'}`);
        console.log(`💳 Payment service: ${this.paymentService.isConfigured() ? 'Ready' : 'Demo Mode'}`);
        console.log(`🌐 WebSocket server: Ready on /ws`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`🎯 Frontend URL: http://localhost:5173`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupServiceHandlers() {
    // WhatsApp message handler
    this.whatsappService.onMessage(async (message) => {
      try {
        console.log(`📱 WhatsApp message from ${message.fromName}: ${message.body}`);
        
        // Broadcast to WebSocket clients
        this.wsService.broadcast('whatsappMessage', message);
        
        // Handle file uploads
        if (message.hasMedia && message.mediaUrl) {
          const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Create print job
          const printJob = {
            id: jobId,
            studentName: message.fromName,
            phoneNumber: message.from,
            fileName: `uploaded_file_${Date.now()}`,
            fileUrl: message.mediaUrl,
            pages: 1, // Will be updated after processing
            cost: 5, // Will be updated after processing
            status: 'pending' as const,
            paymentStatus: 'pending' as const,
            estimatedTime: 5,
            progress: 0
          };
          
          // Save to database
          await this.databaseService.createPrintJob(printJob);
          
          // Add to processing queue
          await this.queueService.addFileProcessingJob(jobId, message.mediaUrl, message.from);
          
          // Broadcast job update
          this.wsService.broadcast('newJob', printJob);
        }
      } catch (error) {
        console.error('Error handling WhatsApp message:', error);
      }
    });

    // Queue updates
    this.queueService.onUpdate((data) => {
      this.wsService.broadcast('queueUpdate', data);
    });
  }

  public async shutdown() {
    console.log('🛑 Shutting down AutoPrint Server...');
    
    if (this.whatsappService) {
      await this.whatsappService.shutdown();
    }
    
    if (this.queueService) {
      await this.queueService.shutdown();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ Server shutdown complete');
    process.exit(0);
  }
}

// Start the server
const server = new AutoPrintServer();

// Graceful shutdown
process.on('SIGINT', () => server.shutdown());
process.on('SIGTERM', () => server.shutdown());

// Start the server
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
