
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, FileText, User, CheckCircle, Printer, AlertCircle, Zap, TrendingUp } from 'lucide-react';

interface PrintJob {
  id: string;
  studentName: string;
  fileName: string;
  pages: number;
  cost: number;
  status: 'pending' | 'printing' | 'completed';
  estimatedTime: number;
  progress?: number;
}

const PrintQueue = () => {
  const printJobs: PrintJob[] = [
    {
      id: '1',
      studentName: 'Rahul Kumar',
      fileName: 'Assignment_Physics.pdf',
      pages: 5,
      cost: 25,
      status: 'printing',
      estimatedTime: 2,
      progress: 65,
    },
    {
      id: '2',
      studentName: 'Priya Singh',
      fileName: 'Project_Report.pdf',
      pages: 12,
      cost: 60,
      status: 'pending',
      estimatedTime: 5,
    },
    {
      id: '3',
      studentName: 'Amit Sharma',
      fileName: 'Notes_Chapter3.pdf',
      pages: 8,
      cost: 40,
      status: 'pending',
      estimatedTime: 8,
    },
    {
      id: '4',
      studentName: 'Sneha Patel',
      fileName: 'Lab_Manual.pdf',
      pages: 3,
      cost: 15,
      status: 'completed',
      estimatedTime: 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing':
        return <Printer className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'printing':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">Printing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">Completed</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">Pending</Badge>;
    }
  };

  const currentJob = printJobs.find(job => job.status === 'printing');
  const queueLength = printJobs.filter(job => job.status === 'pending').length;
  const completedToday = printJobs.filter(job => job.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Currently Printing</p>
                <p className="text-3xl font-bold text-blue-900">{currentJob ? '1' : '0'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">In Queue</p>
                <p className="text-3xl font-bold text-amber-900">{queueLength}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Completed Today</p>
                <p className="text-3xl font-bold text-green-900">{completedToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-100 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Avg Wait Time</p>
                <p className="text-3xl font-bold text-purple-900">4.2m</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Job Highlight */}
      {currentJob && (
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden">
          <CardHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"></div>
            <CardTitle className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              Now Printing
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">{currentJob.studentName}</p>
                  <p className="text-blue-100 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {currentJob.fileName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{currentJob.cost}</p>
                <p className="text-blue-100">{currentJob.pages} pages</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentJob.progress}%</span>
              </div>
              <Progress value={currentJob.progress} className="h-3 bg-white/20" />
              <p className="text-blue-100 text-sm">Est. {currentJob.estimatedTime} minutes remaining</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue List */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Print Queue</CardTitle>
          <p className="text-gray-600">Live status of all print jobs</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {printJobs.map((job, index) => (
              <div
                key={job.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                  job.status === 'printing' 
                    ? 'bg-blue-50 border-blue-200 shadow-lg transform scale-[1.02]' 
                    : job.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                      job.status === 'printing' ? 'bg-blue-500 text-white' :
                      job.status === 'completed' ? 'bg-green-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    {getStatusIcon(job.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-gray-900">{job.studentName}</p>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {job.fileName}
                      </span>
                      <span>{job.pages} pages</span>
                      <span className="font-medium text-green-600">₹{job.cost}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.status === 'printing' && job.progress && (
                    <div className="flex items-center gap-2">
                      <Progress value={job.progress} className="w-16 h-2" />
                      <span className="text-sm text-blue-600 font-medium">{job.progress}%</span>
                    </div>
                  )}
                  {job.estimatedTime > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{job.estimatedTime} min</p>
                      <p className="text-xs text-gray-500">estimated</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintQueue;
