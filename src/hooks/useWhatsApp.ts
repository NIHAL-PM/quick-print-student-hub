
import { useState, useEffect } from 'react';
import { whatsappAPI, processPDFFile, processImageFile, PrintJobRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

export const useWhatsApp = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (phoneNumber: string, message: string) => {
    const success = await whatsappAPI.sendMessage(phoneNumber, message);
    if (success) {
      const botMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        from: 'bot',
        fromName: 'AutoPrint Bot',
        body: message,
        hasMedia: false,
        timestamp: new Date(),
        isFromBot: true
      };
      setMessages(prev => [...prev, botMessage]);
    }
    return success;
  };

  const processFileMessage = async (message: WhatsAppMessage): Promise<PrintJobRequest | null> => {
    if (!message.hasMedia || !message.mediaUrl) return null;

    setIsProcessing(true);
    try {
      // Download file from WhatsApp media URL
      const response = await fetch(message.mediaUrl);
      const blob = await response.blob();
      const file = new File([blob], 'document', { type: blob.type });

      let processingResult;
      if (file.type.includes('pdf')) {
        processingResult = await processPDFFile(file);
      } else if (file.type.includes('image')) {
        processingResult = await processImageFile(file);
      } else {
        throw new Error('Unsupported file type');
      }

      // Extract student name from WhatsApp contact
      const studentName = message.fromName || message.from;

      const printJobRequest: PrintJobRequest = {
        phoneNumber: message.from,
        fileName: file.name,
        fileUrl: message.mediaUrl,
        pages: processingResult.pages,
        cost: processingResult.cost,
        studentName
      };

      // Send quote to user
      await sendMessage(
        message.from,
        `📄 *Print Quote*\n\n` +
        `File: ${file.name}\n` +
        `Pages: ${processingResult.pages}\n` +
        `Cost: ₹${processingResult.cost}\n\n` +
        `Reply with "confirm" to proceed with payment or "cancel" to cancel.`
      );

      toast({
        title: "Quote Sent",
        description: `Sent print quote to ${studentName}`
      });

      return printJobRequest;
    } catch (error) {
      console.error('Error processing file:', error);
      await sendMessage(
        message.from,
        `❌ Sorry, there was an error processing your file. Please make sure it's a valid PDF or image file.`
      );
      
      toast({
        title: "Processing Error",
        description: "Failed to process uploaded file",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommand = async (message: WhatsAppMessage) => {
    const command = message.body.toLowerCase().trim();
    const from = message.from;

    switch (command) {
      case 'status':
        // Get user's job status
        await sendMessage(from, `📋 *Your Print Status*\n\nChecking your position in queue...\n\nYou can also use these commands:\n• "cancel" - Cancel current job\n• "help" - Show all commands`);
        break;

      case 'confirm':
        await sendMessage(from, `✅ *Payment Required*\n\nPlease complete payment using the link below:\n[Payment Link]\n\nOnce paid, your document will be added to the print queue.`);
        break;

      case 'cancel':
        await sendMessage(from, `❌ *Job Cancelled*\n\nYour print job has been cancelled. Send a new file to start over.`);
        break;

      case 'help':
        await sendMessage(from, 
          `🤖 *AutoPrint Commands*\n\n` +
          `📤 *Send a file* - Upload PDF/Image to get quote\n` +
          `✅ *confirm* - Proceed with payment\n` +
          `❌ *cancel* - Cancel current job\n` +
          `📋 *status* - Check queue position\n` +
          `💰 *pricing* - View pricing info\n` +
          `❓ *help* - Show this menu\n\n` +
          `💵 *Pricing: ₹5 per page*\n` +
          `📱 *Payment: UPI/Card/Net Banking*`
        );
        break;

      case 'pricing':
        await sendMessage(from, `💰 *Pricing Information*\n\n📄 Black & White: ₹5 per page\n🎨 Color: ₹10 per page\n📱 Payment via UPI/Card\n⚡ Instant processing`);
        break;

      default:
        if (!message.hasMedia) {
          await sendMessage(from, `👋 Welcome to AutoPrint!\n\n📤 Send me a PDF or image file to get started.\nType "help" for all commands.`);
        }
        break;
    }
  };

  const simulateIncomingMessage = (from: string, body: string, hasMedia = false, mediaUrl?: string) => {
    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      from,
      fromName: `Student ${from.slice(-4)}`,
      body,
      hasMedia,
      mediaUrl,
      timestamp: new Date(),
      isFromBot: false
    };

    setMessages(prev => [...prev, message]);
    
    if (hasMedia) {
      processFileMessage(message);
    } else {
      handleCommand(message);
    }
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    simulateIncomingMessage,
    processFileMessage,
    handleCommand
  };
};
