
import React, { useState, useRef } from 'react';
import { Send, FileText, Image, Printer, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  file?: {
    name: string;
    type: string;
    size: number;
    pages?: number;
  };
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 Send me a PDF or image file and I\'ll help you print it instantly. Cost is just ₹5 per page. Let\'s get started!',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMessage = (text: string, sender: 'user' | 'bot', file?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      file,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const pages = Math.floor(Math.random() * 10) + 1;
    const cost = pages * 5;

    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      pages,
    };

    addMessage(`📎 Uploaded: ${file.name}`, 'user', fileInfo);

    setTimeout(() => {
      addMessage(
        `✨ File processed successfully!\n\n📄 **${file.name}**\n📊 Pages: ${pages}\n💰 Total Cost: ₹${cost}\n\n💳 Reply "confirm" to proceed with secure payment, or "cancel" to abort.`,
        'bot'
      );
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    addMessage(inputText, 'user');
    const userMessage = inputText.toLowerCase();
    
    if (userMessage === 'confirm') {
      setTimeout(() => {
        addMessage('🔐 Secure payment link generated!\n\n💳 Complete your payment to start printing.\n📱 UPI, Cards, and Net Banking accepted.\n\n⚡ Your print job will start immediately after payment confirmation.', 'bot');
        toast.success('Payment link sent to your WhatsApp!', {
          description: 'Complete payment to start printing'
        });
      }, 500);
    } else if (userMessage === 'status') {
      setTimeout(() => {
        addMessage('📋 **Your Print Status**\n\n🎯 Position in queue: #3\n⏱️ Estimated wait time: 5 minutes\n📍 Printer location: Library Ground Floor\n\n🔔 You\'ll get notified when printing starts!', 'bot');
      }, 500);
    } else if (userMessage === 'cancel') {
      setTimeout(() => {
        addMessage('❌ Print job cancelled successfully.\n\n💡 Feel free to upload another file anytime!\n🤝 I\'m here to help with all your printing needs.', 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        addMessage('🤖 I\'m your smart printing assistant!\n\n📤 **Upload a file** to get started\n📊 **Type "status"** to check your queue position\n💰 **Type "confirm"** to proceed with payment\n❌ **Type "cancel"** to abort current job\n\n✨ Let\'s make printing effortless!', 'bot');
      }, 500);
    }

    setInputText('');
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Card className="h-[500px] flex flex-col border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AutoPrint Assistant</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-100">Online • Ready to print</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
              {message.file && (
                <div className={`mt-3 p-3 rounded-xl border-2 border-dashed ${
                  message.sender === 'user' ? 'border-white/30 bg-white/10' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {message.file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>{message.file.name}</span>
                  </div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/80' : 'text-gray-600'}`}>
                    {formatFileSize(message.file.size)}
                    {message.file.pages && ` • ${message.file.pages} pages • ₹${message.file.pages * 5}`}
                  </div>
                </div>
              )}
              <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-12 w-12 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          >
            📎
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 h-12 rounded-2xl border-2 border-gray-200 focus:border-blue-400 px-4 text-base"
          />
          <Button 
            onClick={handleSendMessage} 
            size="sm"
            className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
};

export default ChatInterface;
