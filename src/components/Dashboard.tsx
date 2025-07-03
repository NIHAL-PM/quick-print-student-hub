
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
  AlertCircle,
  Zap,
  Target,
  Activity
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
    successRate: 96.8,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Jobs Today</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{todayStats.totalJobs}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Revenue</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">₹{todayStats.revenue}</div>
            <p className="text-xs text-green-600 mt-1">
              {todayStats.totalPages} pages printed
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Avg Wait Time</CardTitle>
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{todayStats.avgWaitTime}m</div>
            <p className="text-xs text-amber-600 mt-1">
              -2.1 min improvement
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-100 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Success Rate</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{todayStats.successRate}%</div>
            <p className="text-xs text-purple-600 mt-1">
              {todayStats.completed}/{todayStats.totalJobs} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-blue-600" />
              Printer Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-green-200 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                    <Printer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">HP LaserJet Pro - Main</div>
                    <div className="text-sm text-gray-600">Paper: 85% • Toner: 45%</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-300 px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border-2 border-amber-200 bg-amber-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                    <Printer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Canon PIXMA - Backup</div>
                    <div className="text-sm text-gray-600">Paper: 20% • Ink: 75%</div>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 px-3 py-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Low Paper
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-6 h-6 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Assignment_Physics.pdf completed</p>
                  <p className="text-xs text-gray-600">Arjun M. • 2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Lab_Report.pdf started printing</p>
                  <p className="text-xs text-gray-600">Kavya R. • 5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment received ₹35</p>
                  <p className="text-xs text-gray-600">Rohit S. • 8 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Low paper warning</p>
                  <p className="text-xs text-gray-600">Main printer • 15 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
