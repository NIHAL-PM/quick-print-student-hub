
import { Client, LocalAuth, MessageMedia, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';

export interface WhatsAppMessage {
  id: string;
  from: string;
  fromName: string;
  body: string;
  hasMedia: boolean;
  mediaType?: string;
  mediaUrl?: string;
  timestamp: Date;
  isFromBot: boolean;
}

export class WhatsAppService {
  private client: Client;
  private isReady: boolean = false;
  private messageCallbacks: ((message: WhatsAppMessage) => void)[] = [];

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('📱 WhatsApp QR Code - Scan with your phone:');
      qrcode.generate(qr, { small: true });
      console.log('Or visit: https://web.whatsapp.com and scan the QR code above');
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp Client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp Client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp Client disconnected:', reason);
      this.isReady = false;
    });

    this.client.on('message_create', async (message) => {
      if (message.fromMe) return; // Ignore messages sent by the bot
      
      try {
        const whatsappMessage = await this.parseMessage(message);
        
        // Notify all listeners
        this.messageCallbacks.forEach(callback => {
          callback(whatsappMessage);
        });

        // Auto-handle the message
        await this.handleIncomingMessage(whatsappMessage);
      } catch (error) {
        console.error('Error processing WhatsApp message:', error);
      }
    });
  }

  private async parseMessage(message: Message): Promise<WhatsAppMessage> {
    let mediaUrl = '';
    let mediaType = '';
    
    if (message.hasMedia) {
      try {
        const media = await message.downloadMedia();
        if (media) {
          // Save media file
          const fileName = `${Date.now()}_${message.id.id}.${media.mimetype.split('/')[1]}`;
          const filePath = path.join('./uploads', fileName);
          
          // Create uploads directory if it doesn't exist
          if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads', { recursive: true });
          }
          
          // Save the file
          fs.writeFileSync(filePath, media.data, { encoding: 'base64' });
          
          mediaUrl = `/uploads/${fileName}`;
          mediaType = media.mimetype;
        }
      } catch (error) {
        console.error('Error downloading media:', error);
      }
    }

    // Get contact name
    let fromName = message.from;
    try {
      const contact = await message.getContact();
      fromName = contact.pushname || contact.name || message.from;
    } catch (error) {
      console.error('Error getting contact name:', error);
    }

    return {
      id: message.id.id,
      from: message.from,
      fromName,
      body: message.body,
      hasMedia: message.hasMedia,
      mediaType,
      mediaUrl,
      timestamp: new Date(message.timestamp * 1000),
      isFromBot: false
    };
  }

  private async handleIncomingMessage(message: WhatsAppMessage) {
    const command = message.body.toLowerCase().trim();
    const from = message.from;

    console.log(`📱 Received message from ${message.fromName}: ${message.body}`);

    if (message.hasMedia && message.mediaUrl) {
      // Handle file upload
      await this.handleFileMessage(message);
    } else {
      // Handle text commands
      await this.handleTextCommand(message);
    }
  }

  private async handleFileMessage(message: WhatsAppMessage) {
    try {
      await this.sendMessage(
        message.from,
        `📄 *File received!*\n\nProcessing your ${message.mediaType?.includes('pdf') ? 'PDF' : 'image'} file...\n\n⏳ Please wait while I calculate the printing cost.`
      );

      // File processing will be handled by other services
      // This service just acknowledges receipt
      
    } catch (error) {
      console.error('Error handling file message:', error);
      await this.sendMessage(
        message.from,
        `❌ Sorry, there was an error processing your file. Please try again or contact support.`
      );
    }
  }

  private async handleTextCommand(message: WhatsAppMessage) {
    const command = message.body.toLowerCase().trim();
    const from = message.from;

    try {
      switch (command) {
        case 'hi':
        case 'hello':
        case 'start':
          await this.sendMessage(from, 
            `👋 *Welcome to AutoPrint College!* 🎓\n\n` +
            `📤 *Send me a PDF or image* to get started\n` +
            `💰 Pricing: ₹5 per page (B&W)\n` +
            `⚡ Fast & automated printing\n\n` +
            `*Available commands:*\n` +
            `• Send file - Get instant quote\n` +
            `• *status* - Check your jobs\n` +
            `• *help* - Show all commands\n` +
            `• *pricing* - View pricing details`
          );
          break;

        case 'help':
          await this.sendMessage(from,
            `🤖 *AutoPrint Commands*\n\n` +
            `📤 *Send a file* - Upload PDF/Image for printing\n` +
            `✅ *confirm* - Proceed with payment\n` +
            `❌ *cancel* - Cancel current job\n` +
            `📋 *status* - Check queue position\n` +
            `💰 *pricing* - View pricing info\n` +
            `❓ *help* - Show this menu\n\n` +
            `💵 *Pricing: ₹5 per page (B&W)*\n` +
            `📱 *Payment: UPI/Card/Net Banking*\n` +
            `⚡ *Instant processing & updates*`
          );
          break;

        case 'status':
          await this.sendMessage(from,
            `📋 *Your Print Status*\n\n` +
            `Checking your current jobs...\n\n` +
            `💡 *Tip:* Send a file to start a new print job\n` +
            `📞 *Support:* Reply "help" for assistance`
          );
          break;

        case 'pricing':
          await this.sendMessage(from,
            `💰 *AutoPrint Pricing*\n\n` +
            `📄 *Black & White:* ₹5 per page\n` +
            `🎨 *Color:* ₹10 per page\n` +
            `📱 *Payment:* UPI/Card/Net Banking\n` +
            `⚡ *Processing:* Instant\n` +
            `🚀 *Delivery:* 2-5 minutes\n\n` +
            `*No hidden charges!*\n` +
            `What you see is what you pay 💯`
          );
          break;

        case 'confirm':
          await this.sendMessage(from,
            `✅ *Payment Confirmation*\n\n` +
            `Please complete payment using the secure link below:\n` +
            `💳 [Payment Gateway Link]\n\n` +
            `After payment confirmation:\n` +
            `• Job added to print queue\n` +
            `• Real-time status updates\n` +
            `• Ready notification\n\n` +
            `⏱️ *Processing time: 2-5 minutes*`
          );
          break;

        case 'cancel':
          await this.sendMessage(from,
            `❌ *Job Cancellation*\n\n` +
            `Your current print job has been cancelled.\n` +
            `Any pending payments will be refunded within 24 hours.\n\n` +
            `📤 Send a new file to start over\n` +
            `❓ Reply "help" for assistance`
          );
          break;

        default:
          if (!message.hasMedia) {
            await this.sendMessage(from,
              `👋 *Hello!* I'm your AutoPrint assistant.\n\n` +
              `📤 *Send me a PDF or image file* to get started\n` +
              `❓ Type "help" to see all available commands\n\n` +
              `💡 *Quick start:* Just send your document!`
            );
          }
          break;
      }
    } catch (error) {
      console.error('Error handling text command:', error);
      await this.sendMessage(from,
        `❌ Sorry, I encountered an error. Please try again or contact support.`
      );
    }
  }

  async initialize(): Promise<void> {
    console.log('🔄 Initializing WhatsApp service...');
    return this.client.initialize();
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.isReady) {
      console.warn('⚠️ WhatsApp client not ready, cannot send message');
      return false;
    }

    try {
      // Format phone number if needed
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      await this.client.sendMessage(formattedNumber, message);
      console.log(`✅ Message sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async sendFile(phoneNumber: string, filePath: string, caption?: string): Promise<boolean> {
    if (!this.isReady) {
      console.warn('⚠️ WhatsApp client not ready, cannot send file');
      return false;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const media = MessageMedia.fromFilePath(filePath);
      await this.client.sendMessage(formattedNumber, media, { caption });
      console.log(`✅ File sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp file:', error);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add @c.us suffix if not present
    if (!phoneNumber.includes('@')) {
      return `${cleaned}@c.us`;
    }
    
    return phoneNumber;
  }

  onMessage(callback: (message: WhatsAppMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  isConnected(): boolean {
    return this.isReady;
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down WhatsApp service...');
    if (this.client) {
      await this.client.destroy();
    }
  }
}
