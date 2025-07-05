// Real API service for production deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

export interface PrintJob {
  id: string;
  studentName: string;
  phoneNumber: string;
  fileName: string;
  fileUrl: string;
  pages: number;
  cost: number;
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  estimatedTime: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileProcessingResult {
  fileName: string;
  pages: number;
  cost: number;
  fileType: 'pdf' | 'image';
  fileSize: number;
  fileUrl: string;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  status: 'ready' | 'busy' | 'offline' | 'error';
}

class APIService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private wsCallbacks: { [key: string]: Function[] } = {};

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.wsUrl = WS_URL;
  }

  // WebSocket connection management
  connectWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
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
        console.log('❌ WebSocket disconnected');
        this.emit('disconnected');
        // Reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // WebSocket event handling
  on(event: string, callback: Function) {
    if (!this.wsCallbacks[event]) {
      this.wsCallbacks[event] = [];
    }
    this.wsCallbacks[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.wsCallbacks[event]) {
      this.wsCallbacks[event] = this.wsCallbacks[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.wsCallbacks[event]) {
      this.wsCallbacks[event].forEach(callback => callback(data));
    }
  }

  // HTTP API methods
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Print job APIs
  async getAllPrintJobs(): Promise<PrintJob[]> {
    const response = await this.request<{ success: boolean; jobs: PrintJob[] }>('/print/jobs');
    return response.jobs;
  }

  async getPrintJob(id: string): Promise<PrintJob> {
    const response = await this.request<{ success: boolean; job: PrintJob }>(`/print/jobs/${id}`);
    return response.job;
  }

  async createPrintJob(jobData: Omit<PrintJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ jobId: string; job: PrintJob }> {
    const response = await this.request<{ success: boolean; jobId: string; job: PrintJob }>('/print/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    return { jobId: response.jobId, job: response.job };
  }

  async updatePrintJob(id: string, updates: Partial<PrintJob>): Promise<PrintJob> {
    const response = await this.request<{ success: boolean; job: PrintJob }>(`/print/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.job;
  }

  async cancelPrintJob(id: string): Promise<void> {
    await this.request(`/print/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Queue APIs
  async getQueueStatus(): Promise<{ stats: QueueStats; currentQueue: PrintJob[]; activeJobs: PrintJob[] }> {
    const response = await this.request<{
      success: boolean;
      stats: QueueStats;
      currentQueue: PrintJob[];
      activeJobs: PrintJob[];
    }>('/print/queue');
    return {
      stats: response.stats,
      currentQueue: response.currentQueue,
      activeJobs: response.activeJobs,
    };
  }

  // File APIs
  async uploadFile(file: File): Promise<FileProcessingResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.file;
  }

  async processFile(filePath: string, phoneNumber: string, studentName?: string): Promise<{ jobId: string; file: FileProcessingResult; job: PrintJob }> {
    const response = await this.request<{
      success: boolean;
      jobId: string;
      file: FileProcessingResult;
      job: PrintJob;
    }>('/files/process', {
      method: 'POST',
      body: JSON.stringify({ filePath, phoneNumber, studentName }),
    });
    return {
      jobId: response.jobId,
      file: response.file,
      job: response.job,
    };
  }

  // Payment APIs
  async createPayment(jobId: string, amount: number, phoneNumber: string, description?: string): Promise<{ paymentUrl: string; paymentId: string; orderId: string }> {
    const response = await this.request<{
      success: boolean;
      paymentUrl: string;
      paymentId: string;
      orderId: string;
    }>('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ jobId, amount, phoneNumber, description }),
    });
    return {
      paymentUrl: response.paymentUrl,
      paymentId: response.paymentId,
      orderId: response.orderId,
    };
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string, jobId: string): Promise<{ success: boolean; status: string }> {
    const response = await this.request<{
      success: boolean;
      status: string;
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId, orderId, signature, jobId }),
    });
    return response;
  }

  async getPaymentMethods(): Promise<{ methods: string[]; configured: boolean }> {
    const response = await this.request<{
      success: boolean;
      methods: string[];
      configured: boolean;
    }>('/payments/methods');
    return {
      methods: response.methods,
      configured: response.configured,
    };
  }

  // WhatsApp APIs
  async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, message }),
    });
    return response.success;
  }

  async getWhatsAppStatus(): Promise<{ connected: boolean; status: string }> {
    const response = await this.request<{
      success: boolean;
      connected: boolean;
      status: string;
    }>('/whatsapp/status');
    return {
      connected: response.connected,
      status: response.status,
    };
  }

  // Printer APIs
  async getPrinters(): Promise<{ printers: PrinterInfo[]; defaultPrinter: string | null; isReady: boolean }> {
    const response = await this.request<{
      success: boolean;
      printers: PrinterInfo[];
      defaultPrinter: string | null;
      isReady: boolean;
    }>('/print/printers');
    return {
      printers: response.printers,
      defaultPrinter: response.defaultPrinter,
      isReady: response.isReady,
    };
  }

  async testPrint(printerName?: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>('/print/test', {
      method: 'POST',
      body: JSON.stringify({ printerName }),
    });
    return response.success;
  }

  // Health check
  async getHealthStatus(): Promise<{ status: string; services: any }> {
    const response = await this.request<{
      status: string;
      services: any;
    }>('/health');
    return response;
  }
}

// Create singleton instance
export const apiService = new APIService();

// Auto-connect WebSocket
if (typeof window !== 'undefined') {
  apiService.connectWebSocket();
}

export default apiService;