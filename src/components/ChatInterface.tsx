
import React, { useState, useRef } from 'react';
import { Send, FileText, Image, Printer, CheckCircle } from 'lucide-react';
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
      text: 'Hello! Send me a PDF or image file and I\'ll help you print it. Cost is ₹5 per page.',
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

    // Simulate file processing
    const pages = Math.floor(Math.random() * 10) + 1; // Random page count for demo
    const cost = pages * 5;

    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      pages,
    };

    addMessage(`Uploaded: ${file.name}`, 'user', fileInfo);

    // Bot response
    setTimeout(() => {
      addMessage(
        `File processed! 📄 Pages: ${pages} | 💰 Cost: ₹${cost}\n\nReply "confirm" to proceed with payment.`,
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
        addMessage('Payment link generated! Complete payment to start printing.', 'bot');
        toast.success('Payment link sent!');
      }, 500);
    } else if (userMessage === 'status') {
      setTimeout(() => {
        addMessage('Your print job is in queue. Position: #3. Estimated time: 5 minutes.', 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        addMessage('I can help you with printing. Upload a file or type "status" to check your print queue.', 'bot');
      }, 500);
    }

    setInputText('');
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Card className="h-96 flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold flex items-center gap-2">
          <Printer className="w-5 h-5" />
          College Print Bot
        </h3>
        <p className="text-sm opacity-90">Online • Ready to print</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              {message.file && (
                <div className="mt-2 p-2 bg-white/20 rounded border">
                  <div className="flex items-center gap-2 text-xs">
                    {message.file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>{message.file.name}</span>
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {formatFileSize(message.file.size)}
                    {message.file.pages && ` • ${message.file.pages} pages`}
                  </div>
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            📎
          </Button>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="w-4 h-4" />
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
