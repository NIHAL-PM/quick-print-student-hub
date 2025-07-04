
import { useState, useEffect } from 'react';
import { printerWS } from '@/lib/api';

export interface PrintJob {
  id: string;
  studentName: string;
  phoneNumber: string;
  fileName: string;
  fileUrl: string;
  pages: number;
  cost: number;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  estimatedTime: number;
  timestamp: Date;
  progress?: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
}

export const usePrintJobs = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [currentJob, setCurrentJob] = useState<PrintJob | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    printerWS.connect();

    printerWS.on('connected', () => {
      setIsConnected(true);
    });

    printerWS.on('disconnected', () => {
      setIsConnected(false);
    });

    printerWS.on('jobUpdate', (job: PrintJob) => {
      setJobs(prev => prev.map(j => j.id === job.id ? job : j));
      if (currentJob?.id === job.id) {
        setCurrentJob(job);
      }
    });

    printerWS.on('newJob', (job: PrintJob) => {
      setJobs(prev => [...prev, job]);
    });

    printerWS.on('jobStarted', (job: PrintJob) => {
      setCurrentJob(job);
      setJobs(prev => prev.filter(j => j.id !== job.id));
    });

    printerWS.on('jobCompleted', (jobId: string) => {
      if (currentJob?.id === jobId) {
        setCurrentJob(null);
      }
      setJobs(prev => prev.filter(j => j.id !== jobId));
    });

    printerWS.on('queueUpdate', (queueJobs: PrintJob[]) => {
      setJobs(queueJobs);
    });

    return () => {
      printerWS.disconnect();
    };
  }, [currentJob]);

  const addJob = (job: Omit<PrintJob, 'id' | 'timestamp'>) => {
    const newJob: PrintJob = {
      ...job,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    printerWS.send({
      type: 'addJob',
      payload: newJob
    });
  };

  const updateJobStatus = (jobId: string, status: PrintJob['status'], progress?: number) => {
    printerWS.send({
      type: 'updateJob',
      payload: { jobId, status, progress }
    });
  };

  const cancelJob = (jobId: string) => {
    printerWS.send({
      type: 'cancelJob',
      payload: { jobId }
    });
  };

  return {
    jobs,
    currentJob,
    isConnected,
    addJob,
    updateJobStatus,
    cancelJob
  };
};
