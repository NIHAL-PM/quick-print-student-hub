
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Printer, 
  Users, 
  FileText, 
  IndianRupee, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const todayStats = {
    totalJobs: 45,
    completed: 38,
    pending: 5,
    printing: 2,
    revenue: 1875,
    totalPages: 375,
    avgWaitTime: 4.2,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Today</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayStats.revenue}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.totalPages} pages printed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.avgWaitTime} min</div>
            <p className="text-xs text-muted-foreground">
              -2.1 min from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.completed}/{todayStats.totalJobs} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Printer Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium">HP LaserJet Pro - Main</div>
                    <div className="text-sm text-gray-600">Paper: 85% • Toner: 45%</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="font-medium">Canon PIXMA - Backup</div>
                    <div className="text-sm text-gray-600">Paper: 20% • Ink: 75%</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Low Paper</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Assignment_Physics.pdf printed for Arjun M.</span>
                <span className="text-gray-500 ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Printer className="w-4 h-4 text-blue-500" />
                <span>Lab_Report.pdf started printing for Kavya R.</span>
                <span className="text-gray-500 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <IndianRupee className="w-4 h-4 text-green-500" />
                <span>Payment received ₹35 from Rohit S.</span>
                <span className="text-gray-500 ml-auto">8 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Low paper warning - Main printer</span>
                <span className="text-gray-500 ml-auto">15 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
