
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePrintJobs } from '@/hooks/usePrintJobs';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { 
  Printer, 
  CheckCircle, 
  Clock, 
  FileText, 
  User,
  IndianRupee,
  Wifi,
  WifiOff,
  Sparkles,
  Send,
  Target,
  Activity,
  Zap,
  MessageCircle,
  Phone,
  Upload,
  CreditCard,
  Download,
  AlertCircle
} from 'lucide-react';

const PrinterDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { jobs, currentJob, isConnected, updateJobStatus } = usePrintJobs();
  const { messages, simulateIncomingMessage } = useWhatsApp();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate print progress
      if (currentJob && currentJob.status === 'printing' && currentJob.progress !== undefined && currentJob.progress < 100) {
        const newProgress = Math.min(100, currentJob.progress + Math.random() * 3);
        updateJobStatus(currentJob.id, 'printing', newProgress);
        
        if (newProgress >= 100) {
          setTimeout(() => {
            updateJobStatus(currentJob.id, 'completed');
            toast({
              title: "Print Completed!",
              description: `${currentJob.fileName} is ready for pickup`,
            });
          }, 1000);
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [currentJob, updateJobStatus, toast]);

  // Demo function to simulate WhatsApp messages
  const simulateDemo = () => {
    const demoMessages = [
      { from: '+919876543210', body: 'help', hasMedia: false },
      { from: '+919876543211', body: '', hasMedia: true, mediaUrl: 'demo-pdf-url' },
      { from: '+919876543212', body: 'status', hasMedia: false }
    ];

    demoMessages.forEach((msg, index) => {
      setTimeout(() => {
        simulateIncomingMessage(msg.from, msg.body, msg.hasMedia, msg.mediaUrl);
      }, index * 3000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="backdrop-blur-xl bg-white/90 border-b border-white/20 shadow-xl">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Printer className="w-8 h-8 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center animate-pulse ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {isConnected ? <Wifi className="w-3 h-3 text-white" /> : <WifiOff className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AutoPrint Station
              </h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                {isConnected ? 'Connected & Ready' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={simulateDemo} variant="outline" className="hidden md:flex">
              <MessageCircle className="w-4 h-4 mr-2" />
              Demo Messages
            </Button>
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)] gap-6 p-6">
        {/* Current Job Section */}
        <div className="flex-1">
          {currentJob ? (
            <div className="h-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl">
                  <Zap className="w-5 h-5" />
                  <span className="text-xl font-bold">Now Printing</span>
                </div>
              </div>

              <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl h-[calc(100%-100px)]">
                <CardContent className="p-8 h-full flex flex-col justify-center">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <FileText className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <Activity className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentJob.fileName}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                          <User className="w-3 h-3 mr-1" />
                          {currentJob.studentName}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {currentJob.pages}
                          </div>
                          <div className="text-blue-700 font-medium text-sm">Pages</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1 flex items-center justify-center gap-1">
                            <IndianRupee className="w-6 h-6" />
                            {currentJob.cost}
                          </div>
                          <div className="text-green-700 font-medium text-sm">Total Cost</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Progress</span>
                        <span className="text-blue-600 font-bold">{Math.round(currentJob.progress || 0)}%</span>
                      </div>
                      <Progress value={currentJob.progress || 0} className="h-3" />
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Est. {Math.max(1, Math.round((currentJob.estimatedTime * (100 - (currentJob.progress || 0))) / 100))} min remaining
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Printer className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Printer Ready</h3>
                  <p className="text-gray-600 mb-4">Send files via WhatsApp to start printing</p>
                  <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-xl p-3">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">+91-XXXX-XXXXXX</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Print Queue Section */}
        <div className="w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Print Queue</h2>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 font-bold">
              {jobs.length} jobs
            </Badge>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {jobs.map((job, index) => (
              <Card key={job.id} className="bg-white/90 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {job.fileName}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        <span className="truncate">{job.studentName}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="font-bold text-blue-600 text-sm">{job.pages}</div>
                          <div className="text-xs text-blue-700">pages</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <div className="font-bold text-green-600 text-sm flex items-center justify-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {job.cost}
                          </div>
                          <div className="text-xs text-green-700">cost</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-600 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{job.estimatedTime}m</span>
                        </div>
                        <Badge variant={job.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                          {job.paymentStatus === 'paid' ? '✓ Paid' : 'Payment Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {jobs.length === 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-white/40 shadow-lg">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Queue Empty</h3>
                  <p className="text-gray-600 text-sm">Ready for new print jobs</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-2xl">
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">WhatsApp Print Instructions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-3 text-center">
                  <Upload className="w-8 h-8 bg-blue-500 text-white rounded-xl p-2 mx-auto mb-2" />
                  <h4 className="font-bold text-blue-900 text-sm mb-1">Send File</h4>
                  <p className="text-xs text-blue-800">Upload PDF/Image to +91-XXXX-XXXXXX</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-3 text-center">
                  <Target className="w-8 h-8 bg-green-500 text-white rounded-xl p-2 mx-auto mb-2" />
                  <h4 className="font-bold text-green-900 text-sm mb-1">Get Quote</h4>
                  <p className="text-xs text-green-800">Instant quote at ₹5/page</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                <CardContent className="p-3 text-center">
                  <CreditCard className="w-8 h-8 bg-purple-500 text-white rounded-xl p-2 mx-auto mb-2" />
                  <h4 className="font-bold text-purple-900 text-sm mb-1">Pay Securely</h4>
                  <p className="text-xs text-purple-800">UPI/Card/Net Banking</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
                <CardContent className="p-3 text-center">
                  <Download className="w-8 h-8 bg-amber-500 text-white rounded-xl p-2 mx-auto mb-2" />
                  <h4 className="font-bold text-amber-900 text-sm mb-1">Collect</h4>
                  <p className="text-xs text-amber-800">Get your printed docs</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Available Commands:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs text-blue-800">
                      <span><strong>"help"</strong> - Show menu</span>
                      <span><strong>"status"</strong> - Check position</span>
                      <span><strong>"confirm"</strong> - Pay & print</span>
                      <span><strong>"cancel"</strong> - Cancel job</span>
                      <span><strong>"pricing"</strong> - View rates</span>
                      <span><strong>Send file</strong> - Start printing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterDisplay;
