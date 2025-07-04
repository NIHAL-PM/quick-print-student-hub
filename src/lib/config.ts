
// Environment configuration
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    apiKey: import.meta.env.VITE_API_KEY || 'demo-api-key',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
  },
  whatsapp: {
    phoneNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '+91-XXXX-XXXXXX',
    webhookUrl: import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:3001/webhook/whatsapp'
  },
  printer: {
    pricePerPage: 5,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
  },
  payment: {
    gateway: import.meta.env.VITE_PAYMENT_GATEWAY || 'razorpay',
    merchantId: import.meta.env.VITE_MERCHANT_ID || 'demo-merchant',
    currency: 'INR'
  }
};

// Validation functions
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > config.printer.maxFileSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !config.printer.supportedFormats.includes(extension)) {
    return { valid: false, error: 'Unsupported file format' };
  }

  return { valid: true };
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if missing
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  return phone;
};

export const calculatePrintCost = (pages: number, isColor = false): number => {
  const basePrice = config.printer.pricePerPage;
  const colorMultiplier = isColor ? 2 : 1;
  return pages * basePrice * colorMultiplier;
};
