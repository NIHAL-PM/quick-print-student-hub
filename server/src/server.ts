
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
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
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
      // Initialize database first
      this.databaseService = new DatabaseService();
      await this.databaseService.initialize();

      // Initialize other services
      this.fileService = new FileService();
      this.printerService = new PrinterService();
      this.paymentService = new PaymentService();
      this.queueService = new QueueService();
      
      // Initialize WhatsApp service (this may take time for QR scanning)
      this.whatsappService = new WhatsAppService();
      
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      process.exit(1);
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
    
    // Connect services to WebSocket for real-time updates
    this.queueService.onUpdate((data) => {
      this.wsService.broadcast('queueUpdate', data);
    });

    this.whatsappService.onMessage((data) => {
      this.wsService.broadcast('whatsappMessage', data);
    });
  }

  public async start() {
    try {
      // Start WhatsApp service
      await this.whatsappService.initialize();
      
      // Start the server
      this.server.listen(this.port, () => {
        console.log(`🚀 AutoPrint Server running on port ${this.port}`);
        console.log(`📱 WhatsApp Web integration: ${this.whatsappService.isConnected() ? 'Connected' : 'Connecting...'}`);
        console.log(`🖨️  Printer service: ${this.printerService.isReady() ? 'Ready' : 'Initializing...'}`);
        console.log(`💳 Payment service: Ready`);
        console.log(`🌐 WebSocket server: Ready on /ws`);
        console.log(`📊 Admin interface: http://localhost:${this.port}/health`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
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
