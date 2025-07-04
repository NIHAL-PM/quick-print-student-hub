
import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface PaymentRequest {
  amount: number;
  currency: string;
  jobId: string;
  phoneNumber: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

export interface PaymentVerification {
  success: boolean;
  transactionId?: string;
  status: 'completed' | 'failed' | 'pending';
  error?: string;
}

export class PaymentService {
  private razorpay: Razorpay | null = null;
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (this.keyId && this.keySecret) {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
      console.log('✅ Razorpay payment service initialized');
    } else {
      console.warn('⚠️ Razorpay credentials not configured - payment service disabled');
    }
  }

  async createPaymentLink(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.razorpay) {
      return {
        success: false,
        error: 'Payment service not configured'
      };
    }

    try {
      // Create Razorpay order
      const order = await this.razorpay.orders.create({
        amount: Math.round(request.amount * 100), // Amount in paise
        currency: request.currency.toUpperCase(),
        receipt: `receipt_${request.jobId}`,
        notes: {
          jobId: request.jobId,
          phoneNumber: request.phoneNumber,
          description: request.description
        }
      });

      // Create payment link
      const paymentLink = await this.razorpay.paymentLink.create({
        amount: Math.round(request.amount * 100),
        currency: request.currency.toUpperCase(),
        description: request.description,
        customer: {
          contact: request.phoneNumber
        },
        notify: {
          sms: true,
          whatsapp: true
        },
        reminder_enable: true,
        notes: {
          jobId: request.jobId,
          phoneNumber: request.phoneNumber
        },
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payments/callback`,
        callback_method: 'get'
      });

      console.log(`💳 Payment link created for job ${request.jobId}: ${paymentLink.short_url}`);

      return {
        success: true,
        paymentUrl: paymentLink.short_url,
        paymentId: paymentLink.id,
        orderId: order.id
      };
    } catch (error) {
      console.error('❌ Payment link creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<PaymentVerification> {
    if (!this.razorpay) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment service not configured'
      };
    }

    try {
      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return {
          success: false,
          status: 'failed',
          error: 'Invalid payment signature'
        };
      }

      // Fetch payment details
      const payment = await this.razorpay.payments.fetch(paymentId);

      if (payment.status === 'captured') {
        console.log(`✅ Payment verified: ${paymentId}`);
        return {
          success: true,
          status: 'completed',
          transactionId: paymentId
        };
      } else {
        return {
          success: false,
          status: 'pending',
          error: `Payment status: ${payment.status}`
        };
      }
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  async handleWebhook(body: any, signature: string): Promise<{ success: boolean; event?: any; error?: string }> {
    if (!this.keySecret) {
      return { success: false, error: 'Webhook secret not configured' };
    }

    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return { success: false, error: 'Invalid webhook signature' };
      }

      const event = body.event;
      const payload = body.payload;

      console.log(`📨 Webhook received: ${event}`);

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentSuccess(payload.payment.entity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailure(payload.payment.entity);
          break;
        case 'order.paid':
          await this.handleOrderPaid(payload.order.entity);
          break;
        default:
          console.log(`ℹ️ Unhandled webhook event: ${event}`);
      }

      return { success: true, event };
    } catch (error) {
      console.error('❌ Webhook handling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      };
    }
  }

  private async handlePaymentSuccess(payment: any) {
    console.log(`✅ Payment successful: ${payment.id}`);
    // This will be handled by the main application logic
    // to update job status and trigger printing
  }

  private async handlePaymentFailure(payment: any) {
    console.log(`❌ Payment failed: ${payment.id}`);
    // This will be handled by the main application logic
    // to update job status and notify user
  }

  private async handleOrderPaid(order: any) {
    console.log(`✅ Order paid: ${order.id}`);
    // This will be handled by the main application logic
  }

  // Generate UPI payment link (alternative to Razorpay)
  generateUPILink(amount: number, upiId: string, name: string, note: string): string {
    const params = new URLSearchParams({
      pa: upiId,
      pn: name,
      am: amount.toString(),
      cu: 'INR',
      tn: note
    });

    return `upi://pay?${params.toString()}`;
  }

  // Check if payment service is configured
  isConfigured(): boolean {
    return this.razorpay !== null;
  }

  // Get supported payment methods
  getSupportedMethods(): string[] {
    const methods = ['upi'];
    if (this.isConfigured()) {
      methods.push('razorpay', 'card', 'netbanking', 'wallet');
    }
    return methods;
  }
}
