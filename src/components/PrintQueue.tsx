
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, FileText, User, CheckCircle, Printer } from 'lucide-react';

interface PrintJob {
  id: string;
  studentName: string;
  fileName: string;
  pages: number;
  cost: number;
  status: 'pending' | 'printing' | 'completed';
  estimatedTime: number;
}

const PrintQueue = () => {
  const printJobs: PrintJob[] = [
    {
      id: '1',
      studentName: 'Rahul Kumar',
      fileName: 'Assignment_1.pdf',
      pages: 5,
      cost: 25,
      status: 'printing',
      estimatedTime: 2,
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
        return <Printer className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const currentJob = printJobs.find(job => job.status === 'printing');
  const queueLength = printJobs.filter(job => job.status === 'pending').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {currentJob ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Currently Printing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{queueLength}</div>
              <div className="text-sm text-gray-600">In Queue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {printJobs.filter(job => job.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Print Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {printJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{job.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span>{job.fileName}</span>
                      <span>•</span>
                      <span>{job.pages} pages</span>
                      <span>•</span>
                      <span>₹{job.cost}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {job.status === 'printing' && (
                    <Progress value={65} className="w-20" />
                  )}
                  {job.estimatedTime > 0 && (
                    <div className="text-sm text-gray-500">
                      {job.estimatedTime} min
                    </div>
                  )}
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
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
