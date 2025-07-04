
import express from 'express';
import { WhatsAppService } from '../services/WhatsAppService';

const router = express.Router();

// Send message to WhatsApp
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    const whatsappService = req.app.locals.whatsappService as WhatsAppService;
    const success = await whatsappService.sendMessage(phoneNumber, message);
    
    res.json({ success });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Send file via WhatsApp
router.post('/send-file', async (req, res) => {
  try {
    const { phoneNumber, filePath, caption } = req.body;
    
    if (!phoneNumber || !filePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and file path are required' 
      });
    }

    const whatsappService = req.app.locals.whatsappService as WhatsAppService;
    const success = await whatsappService.sendFile(phoneNumber, filePath, caption);
    
    res.json({ success });
  } catch (error) {
    console.error('WhatsApp send file error:', error);
    res.status(500).json({ success: false, error: 'Failed to send file' });
  }
});

// Get WhatsApp connection status
router.get('/status', async (req, res) => {
  try {
    const whatsappService = req.app.locals.whatsappService as WhatsAppService;
    const isConnected = whatsappService.isConnected();
    
    res.json({ 
      success: true, 
      connected: isConnected,
      status: isConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    console.error('WhatsApp status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

// Webhook for incoming WhatsApp messages (if using WhatsApp Business API)
router.post('/webhook', async (req, res) => {
  try {
    // This would be used if integrating with WhatsApp Business API
    // For whatsapp-web.js, messages are handled internally
    
    console.log('WhatsApp webhook received:', req.body);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
