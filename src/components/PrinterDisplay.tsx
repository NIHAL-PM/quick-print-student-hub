
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Printer, 
  CheckCircle, 
  Clock, 
  FileText, 
  User,
  IndianRupee,
  Wifi
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
    <div className="min-h-screen bg-black text-white font-light">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Printer className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">AutoPrint Station</h1>
            <p className="text-gray-400 text-sm">Building A • Floor 2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Wifi className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-light">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Current Job - Left Side */}
        <div className="flex-1 p-8 border-r border-gray-800">
          {currentJob ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-light mb-2">Now Printing</h2>
                <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
              </div>

              <Card className="bg-gray-900 border-gray-800 p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-medium text-white mb-2">
                      {currentJob.fileName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{currentJob.studentName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-6">
                    <div className="text-center">
                      <div className="text-3xl font-light text-white mb-1">
                        {currentJob.pages}
                      </div>
                      <div className="text-sm text-gray-400">Pages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-light text-green-400 mb-1 flex items-center justify-center gap-1">
                        <IndianRupee className="w-6 h-6" />
                        {currentJob.cost}
                      </div>
                      <div className="text-sm text-gray-400">Cost</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{currentJob.progress}%</span>
                    </div>
                    <Progress 
                      value={currentJob.progress} 
                      className="h-3 bg-gray-800"
                    />
                    <div className="text-center text-gray-400 text-sm">
                      Estimated completion: {currentJob.estimatedTime} minutes
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                  <Printer className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-light text-gray-400">Printer Ready</h3>
                <p className="text-gray-500">Send your files to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Queue - Right Side */}
        <div className="w-[400px] p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light">Queue</h2>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {queueJobs.length} jobs
              </Badge>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {queueJobs.map((job, index) => (
                <Card key={job.id} className="bg-gray-900 border-gray-800 p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <h4 className="font-medium text-white text-sm truncate">
                          {job.fileName}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400 truncate">
                          {job.studentName}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{job.pages} pages</span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {job.cost}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{job.estimatedTime}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {queueJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">No jobs in queue</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterDisplay;
