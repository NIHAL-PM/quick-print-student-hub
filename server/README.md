
# AutoPrint College Backend

Fully automated WhatsApp-integrated print system for colleges.

## Features

- 📱 **WhatsApp Integration** - Full whatsapp-web.js implementation
- 🖨️ **Windows Printer Support** - Direct printer integration
- 💳 **Payment Processing** - Razorpay & UPI integration
- 📄 **File Processing** - PDF page counting, image optimization
- ⚡ **Real-time Updates** - WebSocket-based live updates
- 🗄️ **Database** - SQLite for job and payment tracking
- 📋 **Queue Management** - Bull queue with Redis
- 🔒 **Security** - JWT authentication, file validation

## Quick Start

### Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Redis** - Download from [redis.io](https://redis.io/download) or use Docker
3. **Windows** - This version is optimized for Windows

### Installation

1. **Clone & Setup**
   ```bash
   cd server
   node setup.js
   npm install
   ```

2. **Configure Environment**
   - Run the setup script to generate `.env` file
   - Add your Razorpay credentials for payments
   - Configure printer settings

3. **Start Redis** (if not using Docker)
   ```bash
   redis-server
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```

5. **Scan WhatsApp QR Code**
   - QR code will appear in terminal
   - Scan with your WhatsApp mobile app
   - Wait for "WhatsApp Client is ready!" message

## Configuration

### Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-session

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Printing
DEFAULT_PRINTER_NAME=your_printer_name
PRICE_PER_PAGE=5
PRICE_PER_COLOR_PAGE=10

# Database
DATABASE_PATH=./data/autoprint.db

# Security
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

### Printer Setup

1. **Install Printer Drivers**
   - Ensure your printer is properly installed in Windows
   - Set a default printer if desired

2. **PDF Printing (Recommended)**
   - Install Adobe Reader for best PDF printing
   - Alternative: Install SumatraPDF for lightweight PDF handling

3. **Test Printing**
   ```bash
   curl -X POST http://localhost:3001/api/print/test
   ```

## API Endpoints

### Print Jobs
- `GET /api/print/jobs` - Get all print jobs
- `POST /api/print/jobs` - Create new print job
- `GET /api/print/jobs/:id` - Get specific job
- `PATCH /api/print/jobs/:id/status` - Update job status
- `POST /api/print/jobs/:id/print` - Start printing job
- `DELETE /api/print/jobs/:id` - Cancel job

### File Management
- `POST /api/files/upload` - Upload file for processing
- `POST /api/files/process-whatsapp` - Process WhatsApp file
- `DELETE /api/files/:fileName` - Delete file
- `POST /api/files/cleanup` - Cleanup old files

### Payments
- `POST /api/payments/create` - Create payment link
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Payment webhook
- `POST /api/payments/upi` - Generate UPI link

### WhatsApp
- `POST /api/whatsapp/send` - Send message
- `POST /api/whatsapp/send-file` - Send file
- `GET /api/whatsapp/status` - Connection status

### WebSocket
- `ws://localhost:3001/ws` - Real-time updates

## WhatsApp Commands

Users can interact with the bot using these commands:

- **Send File** - Upload PDF/Image for printing
- **confirm** - Proceed with payment
- **cancel** - Cancel current job
- **status** - Check job status
- **help** - Show all commands
- **pricing** - View pricing information

## File Processing

### Supported Formats
- **PDF** - Automatic page counting
- **Images** - JPG, PNG, WebP (converted to PDF)
- **Max Size** - 10MB per file

### Processing Pipeline
1. File upload/download from WhatsApp
2. Format validation and security checks
3. PDF page counting or image optimization
4. Cost calculation
5. Job creation in database
6. Quote sent to user via WhatsApp

## Payment Flow

1. **File Processing** - User uploads file
2. **Quote Generation** - System calculates cost
3. **Payment Link** - Razorpay link sent via WhatsApp
4. **Payment Verification** - Webhook confirms payment
5. **Print Queue** - Job added to printing queue
6. **Printing** - Document sent to printer
7. **Completion** - User notified via WhatsApp

## Queue Management

### Job States
- `pending` - Awaiting payment
- `printing` - Currently printing
- `completed` - Print job finished
- `failed` - Print job failed
- `cancelled` - Job cancelled

### Queue Monitoring
```bash
# View queue status
curl http://localhost:3001/api/print/queue

# WebSocket for real-time updates
wscat -c ws://localhost:3001/ws
```

## Database Schema

### Print Jobs
```sql
- id (TEXT PRIMARY KEY)
- studentName (TEXT)
- phoneNumber (TEXT)
- fileName (TEXT)
- fileUrl (TEXT)
- pages (INTEGER)
- cost (REAL)
- status (TEXT)
- paymentStatus (TEXT)
- transactionId (TEXT)
- estimatedTime (INTEGER)
- progress (INTEGER)
- createdAt (DATETIME)
- updatedAt (DATETIME)
```

### Payments
```sql
- id (TEXT PRIMARY KEY)
- jobId (TEXT)
- amount (REAL)
- currency (TEXT)
- paymentId (TEXT)
- status (TEXT)
- gateway (TEXT)
- createdAt (DATETIME)
- updatedAt (DATETIME)
```

## Troubleshooting

### Common Issues

1. **WhatsApp Connection Failed**
   - Delete `./whatsapp-session` folder
   - Restart server and rescan QR code
   - Check firewall settings

2. **Printer Not Found**
   - Run `wmic printer list brief` to see available printers
   - Update `DEFAULT_PRINTER_NAME` in .env
   - Install proper printer drivers

3. **Payment Issues**
   - Verify Razorpay credentials
   - Check webhook URL configuration
   - Ensure HTTPS for production webhooks

4. **File Processing Errors**
   - Check file permissions in uploads folder
   - Verify file size limits
   - Ensure sufficient disk space

5. **Redis Connection Issues**
   - Start Redis server: `redis-server`
   - Check Redis port configuration
   - Use Docker: `docker run -d -p 6379:6379 redis`

### Logs

Server logs are displayed in console. For production:

```bash
# Save logs to file
npm start > autoprint.log 2>&1

# Monitor logs
tail -f autoprint.log
```

## Production Deployment

### Windows Service

1. **Install PM2**
   ```bash
   npm install -g pm2
   npm install -g pm2-windows-service
   ```

2. **Setup Service**
   ```bash
   pm2 install pm2-windows-service
   pm2-service-install
   pm2 start src/server.ts --name autoprint
   pm2 save
   ```

### Security Checklist

- [ ] Change default JWT_SECRET and API_KEY
- [ ] Enable Windows Firewall rules
- [ ] Use HTTPS for production
- [ ] Secure Razorpay webhook endpoints
- [ ] Regular database backups
- [ ] File cleanup automation
- [ ] Monitor disk space usage

## Support

For technical support or customization:

1. Check troubleshooting section
2. Review server logs
3. Test individual components
4. Verify configuration files

## License

Proprietary - AutoPrint College System
```

This completes the full backend implementation. The system includes:

1. **Complete WhatsApp integration** with QR code scanning
2. **Windows printer support** with multiple printer detection
3. **Payment processing** with Razorpay and UPI
4. **File processing** for PDFs and images
5. **Real-time queue management** with Bull/Redis
6. **SQLite database** for data persistence
7. **WebSocket server** for live updates
8. **Comprehensive API** for all operations
9. **Security features** and error handling
10. **Production-ready setup** with Windows service support

The backend is now fully functional and ready for your local Windows deployment!
