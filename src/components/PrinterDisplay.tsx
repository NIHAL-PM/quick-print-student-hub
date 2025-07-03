
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  CheckCircle, 
  Clock, 
  FileText, 
  User,
  IndianRupee,
  Wifi,
  Sparkles,
  Send,
  Image,
  ArrowRight,
  Zap,
  Target,
  Activity
} from 'lucide-react';

interface PrintJob {
  id: string;
  studentName: string;
  fileName: string;
  pages: number;
  cost: number;
  status: 'pending' | 'printing' | 'completed';
  estimatedTime: number;
  timestamp: Date;
  progress?: number;
}

const PrinterDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentJob, setCurrentJob] = useState<PrintJob | null>({
    id: '1',
    studentName: 'Rahul Kumar',
    fileName: 'Assignment_Mathematics.pdf',
    pages: 8,
    cost: 40,
    status: 'printing',
    estimatedTime: 3,
    timestamp: new Date(),
    progress: 65
  });

  const [queueJobs] = useState<PrintJob[]>([
    {
      id: '2',
      studentName: 'Priya Singh',
      fileName: 'Lab_Report_Physics.pdf',
      pages: 12,
      cost: 60,
      status: 'pending',
      estimatedTime: 5,
      timestamp: new Date(Date.now() + 1000 * 60 * 5)
    },
    {
      id: '3',
      studentName: 'Amit Sharma',
      fileName: 'Project_Documentation.pdf',
      pages: 15,
      cost: 75,
      status: 'pending',
      estimatedTime: 8,
      timestamp: new Date(Date.now() + 1000 * 60 * 10)
    },
    {
      id: '4',
      studentName: 'Kavya Patel',
      fileName: 'Research_Paper.pdf',
      pages: 6,
      cost: 30,
      status: 'pending',
      estimatedTime: 3,
      timestamp: new Date(Date.now() + 1000 * 60 * 15)
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-xl">
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Printer className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Wifi className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AutoPrint Station
              </h1>
              <p className="text-gray-500 font-medium">Building A • Floor 2 • Ready to Print</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Current Job - Enhanced Design */}
        <div className="flex-1 p-8">
          {currentJob ? (
            <div className="space-y-8 h-full">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl mb-6">
                  <Zap className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Now Printing</h2>
                </div>
              </div>

              <Card className="bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
                <CardContent className="p-12 relative z-10">
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <FileText className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {currentJob.fileName}
                      </h3>
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-medium">
                          <User className="w-4 h-4" />
                          <span>{currentJob.studentName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-8">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {currentJob.pages}
                          </div>
                          <div className="text-blue-700 font-medium">Pages</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-1">
                            <IndianRupee className="w-8 h-8" />
                            {currentJob.cost}
                          </div>
                          <div className="text-green-700 font-medium">Total Cost</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-lg font-medium">
                        <span className="text-gray-700">Printing Progress</span>
                        <span className="text-blue-600 font-bold">{currentJob.progress}%</span>
                      </div>
                      <Progress 
                        value={currentJob.progress} 
                        className="h-4 bg-gray-200 rounded-full overflow-hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">
                          Estimated completion: {currentJob.estimatedTime} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl">
                <CardContent className="p-16 text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Printer className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Printer Ready</h3>
                  <p className="text-gray-600 text-lg">Send your files via WhatsApp to get started</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Enhanced Queue Section */}
        <div className="w-[500px] p-8 border-l border-white/20">
          <div className="space-y-6 h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Print Queue</h2>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-lg font-bold shadow-lg">
                {queueJobs.length} jobs
              </Badge>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {queueJobs.map((job, index) => (
                <Card key={job.id} className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-lg font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <h4 className="font-bold text-gray-900 text-lg truncate">
                            {job.fileName}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 font-medium truncate">
                            {job.studentName}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-blue-600">{job.pages}</div>
                            <div className="text-xs text-blue-700">pages</div>
                          </div>
                          <div className="bg-green-50 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {job.cost}
                            </div>
                            <div className="text-xs text-green-700">cost</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mt-4 text-amber-600 bg-amber-50 rounded-xl p-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{job.estimatedTime}m wait</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {queueJobs.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs in Queue</h3>
                  <p className="text-gray-600">All caught up! Ready for new print jobs.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Panel - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-2xl">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">How to Print via WhatsApp</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-blue-900 mb-2">Step 1</h4>
                  <p className="text-sm text-blue-800">Send PDF/Image to<br/>WhatsApp: <strong>+91-XXXX-XXXXXX</strong></p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-green-900 mb-2">Step 2</h4>
                  <p className="text-sm text-green-800">Get instant quote<br/>₹5 per page</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <IndianRupee className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-purple-900 mb-2">Step 3</h4>
                  <p className="text-sm text-purple-800">Pay securely via<br/>UPI/Card/Net Banking</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Printer className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-amber-900 mb-2">Step 4</h4>
                  <p className="text-sm text-amber-800">Collect your<br/>printed documents</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 text-blue-800">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Commands Available:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <span><strong>"status"</strong> - Check your position</span>
                    <span><strong>"confirm"</strong> - Proceed with payment</span>
                    <span><strong>"cancel"</strong> - Cancel current job</span>
                    <span><strong>Send file</strong> - Start new print job</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterDisplay;
