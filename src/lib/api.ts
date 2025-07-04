
// WhatsApp Web API integration
export interface WhatsAppMessage {
  id: string;
  from: string;
  body: string;
  hasMedia: boolean;
  mediaUrl?: string;
  timestamp: Date;
}

export interface PrintJobRequest {
  phoneNumber: string;
  fileName: string;
  fileUrl: string;
  pages: number;
  cost: number;
  studentName?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

class WhatsAppAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.apiKey = process.env.REACT_APP_API_KEY || 'your-api-key';
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ phoneNumber, message })
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async uploadFile(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.fileUrl;
      }
      return null;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }

  async createPrintJob(jobData: PrintJobRequest): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/print-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const data = await response.json();
        return data.jobId;
      }
      return null;
    } catch (error) {
      console.error('Failed to create print job:', error);
      return null;
    }
  }

  async processPayment(jobId: string, amount: number, phoneNumber: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ jobId, amount, phoneNumber })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to process payment:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }
}

export const whatsappAPI = new WhatsAppAPI();

// PDF processing utilities
export const processPDFFile = async (file: File): Promise<{ pages: number; cost: number }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Simulate PDF processing - in real implementation, use PDF-lib or similar
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Simple heuristic: estimate pages based on file size and content
        const fileSizeKB = file.size / 1024;
        let estimatedPages = Math.max(1, Math.round(fileSizeKB / 50)); // Rough estimate
        
        // Look for PDF page markers in the binary data
        const text = String.fromCharCode.apply(null, Array.from(uint8Array.slice(0, 1024)));
        const pageMatches = text.match(/\/Count\s+(\d+)/);
        if (pageMatches) {
          estimatedPages = parseInt(pageMatches[1]);
        }

        const cost = estimatedPages * 5; // ₹5 per page
        resolve({ pages: estimatedPages, cost });
      } catch (error) {
        console.error('Error processing PDF:', error);
        resolve({ pages: 1, cost: 5 });
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

// Image processing utilities
export const processImageFile = async (file: File): Promise<{ pages: number; cost: number }> => {
  return { pages: 1, cost: 5 }; // Images are always 1 page
};

// WebSocket connection for real-time updates
export class PrinterWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: { [key: string]: Function[] } = {};

  connect() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to printer WebSocket');
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from printer WebSocket');
      this.emit('disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  emit(event: string, data?: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const printerWS = new PrinterWebSocket();
