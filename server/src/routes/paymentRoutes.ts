
import express from 'express';
import { PaymentService } from '../services/PaymentService';
import { DatabaseService } from '../services/DatabaseService';
import { QueueService } from '../services/QueueService';

const router = express.Router();

// Create payment link
router.post('/create', async (req, res) => {
  try {
    const { jobId, amount, phoneNumber, description } = req.body;
    
    if (!jobId || !amount || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const paymentService = req.app.locals.paymentService as PaymentService;
    
    const paymentRequest = {
      amount: parseFloat(amount),
      currency: 'INR',
      jobId,
      phoneNumber,
      description: description || `AutoPrint - Job ${jobId}`
    };

    const result = await paymentService.createPaymentLink(paymentRequest);
    
    if (result.success) {
      // Create payment record in database
      const db = req.app.locals.databaseService as DatabaseService;
      await db.createPayment({
        id: `pay_${Date.now()}`,
        jobId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentId: result.paymentId,
        status: 'pending',
        gateway: 'razorpay'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment' });
  }
});

// Payment verification
router.post('/verify', async (req, res) => {
  try {
    const { paymentId, orderId, signature, jobId } = req.body;
    
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payment verification data' 
      });
    }

    const paymentService = req.app.locals.paymentService as PaymentService;
    const verification = await paymentService.verifyPayment(paymentId, orderId, signature);
    
    if (verification.success) {
      const db = req.app.locals.databaseService as DatabaseService;
      const queue = req.app.locals.queueService as QueueService;
      
      // Update payment status
      await db.updatePayment(`pay_${jobId}`, {
        status: 'completed',
        paymentId: verification.transactionId
      });
      
      // Update job payment status
      await db.updatePrintJob(jobId, {
        paymentStatus: 'paid',
        transactionId: verification.transactionId
      });
      
      // Add job to print queue
      await queue.addPrintJob(jobId);
    }

    res.json(verification);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

// Payment webhook
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const paymentService = req.app.locals.paymentService as PaymentService;
    
    const result = await paymentService.handleWebhook(req.body, signature);
    
    if (result.success) {
      // Process webhook event
      const event = result.event;
      // Handle different webhook events as needed
      
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment callback (for payment links)
router.get('/callback', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.query;
    
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      // Payment successful - redirect to success page
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?payment_id=${razorpay_payment_id}`);
    } else {
      // Payment failed - redirect to failure page
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`);
  }
});

// Generate UPI link
router.post('/upi', async (req, res) => {
  try {
    const { amount, note } = req.body;
    
    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount is required' 
      });
    }

    const paymentService = req.app.locals.paymentService as PaymentService;
    const upiId = process.env.UPI_ID || 'autoprint@upi';
    const merchantName = process.env.MERCHANT_NAME || 'AutoPrint College';
    
    const upiLink = paymentService.generateUPILink(
      parseFloat(amount),
      upiId,
      merchantName,
      note || 'AutoPrint Payment'
    );

    res.json({ 
      success: true, 
      upiLink,
      qrCode: `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || 'AutoPrint Payment')}`
    });
  } catch (error) {
    console.error('UPI link generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate UPI link' });
  }
});

// Get supported payment methods
router.get('/methods', async (req, res) => {
  try {
    const paymentService = req.app.locals.paymentService as PaymentService;
    const methods = paymentService.getSupportedMethods();
    
    res.json({ 
      success: true, 
      methods,
      configured: paymentService.isConfigured()
    });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({ success: false, error: 'Failed to get payment methods' });
  }
});

export default router;
