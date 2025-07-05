
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, FileText, User, CheckCircle, Printer, TrendingUp, Zap } from 'lucide-react';
import { apiService, PrintJob } from '@/lib/apiService';

const PrintQueue = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrintJobs();
    
    // Set up WebSocket listeners
    const handleNewJob = (job: PrintJob) => {
      setPrintJobs(prev => [...prev, job]);
    };

    const handleJobUpdate = (job: PrintJob) => {
      setPrintJobs(prev => prev.map(j => j.id === job.id ? job : j));
    };

    const handleJobCompleted = (jobId: string) => {
      setPrintJobs(prev => prev.filter(j => j.id !== jobId));
    };

    apiService.on('newJob', handleNewJob);
    apiService.on('jobUpdate', handleJobUpdate);
    apiService.on('jobCompleted', handleJobCompleted);

    return () => {
      apiService.off('newJob', handleNewJob);
      apiService.off('jobUpdate', handleJobUpdate);
      apiService.off('jobCompleted', handleJobCompleted);
    };
  }, []);

  const loadPrintJobs = async () => {
    try {
      setLoading(true);
      const jobs = await apiService.getAllPrintJobs();
      setPrintJobs(jobs.filter(job => job.status !== 'completed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load print jobs');
      console.error('Error loading print jobs:', err);
      // Fallback to demo data if API fails
      setPrintJobs([
        {
          id: '1',
          studentName: 'Rahul Kumar',
          phoneNumber: '+919876543210',
          fileName: 'Assignment_Physics.pdf',
          fileUrl: '/uploads/assignment.pdf',
          pages: 5,
          cost: 25,
          status: 'printing',
          paymentStatus: 'paid',
          estimatedTime: 2,
          progress: 65,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          studentName: 'Priya Singh',
          phoneNumber: '+919876543211',
          fileName: 'Project_Report.pdf',
          fileUrl: '/uploads/report.pdf',
          pages: 12,
          cost: 60,
          status: 'pending',
          paymentStatus: 'paid',
          estimatedTime: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200 font-medium">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">Cancelled</Badge>;
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
