
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/ChatInterface';
import PrintQueue from '@/components/PrintQueue';
import Dashboard from '@/components/Dashboard';
import { 
  MessageSquare, 
  Printer, 
  BarChart3, 
  Smartphone,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Printer className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AutoPrint College</h1>
                <p className="text-sm text-gray-600 font-medium">Next-Gen Printing Automation</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live System</span>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Revolutionary Printing Solution</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Print Smart,<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Print Instantly
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Send files via WhatsApp, pay seamlessly, and collect your prints. 
            Zero queues, zero waiting, infinite convenience.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">Instant file sharing</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">Lightning Fast</h3>
                <p className="text-sm text-gray-600">Instant processing</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">Secure Pay</h3>
                <p className="text-sm text-gray-600">UPI integration</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">24/7 Ready</h3>
                <p className="text-sm text-gray-600">Always available</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium Tabs */}
        <Tabs defaultValue="queue" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 h-14 bg-white/50 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-1">
              <TabsTrigger 
                value="queue" 
                className="flex items-center gap-3 text-base font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <Printer className="w-5 h-5" />
                <span className="hidden sm:inline">Print Queue</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-3 text-base font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Chat Demo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-3 text-base font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="queue" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Live Print Queue</h3>
              <p className="text-gray-600">Real-time status of all print jobs</p>
            </div>
            <PrintQueue />
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <Card className="mb-6 border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-900">WhatsApp Bot Simulation</CardTitle>
                  <p className="text-gray-600 text-lg">
                    Experience the magic - upload files or try commands like "status" or "confirm"
                  </p>
                </CardHeader>
              </Card>
              <ChatInterface />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">System Analytics</h3>
              <p className="text-gray-600">Performance metrics and insights</p>
            </div>
            <Dashboard />
          </TabsContent>
        </Tabs>

        {/* Premium Footer Section */}
        <Card className="mt-16 border-0 shadow-2xl bg-gradient-to-r from-gray-900 to-blue-900 text-white overflow-hidden">
          <CardHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
            <CardTitle className="text-2xl relative z-10">Implementation Ready</CardTitle>
            <p className="text-blue-100 text-lg relative z-10">Enterprise-grade solution with cutting-edge technology</p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-4 text-blue-200 text-lg">Core Technologies</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span><strong>whatsapp-web.js:</strong> WhatsApp automation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span><strong>Node.js + Express:</strong> Backend server</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span><strong>pdf-lib.js:</strong> PDF processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span><strong>Razorpay/UPI:</strong> Payment processing</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 text-blue-200 text-lg">Key Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Automated page counting & pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Real-time payment verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Intelligent queue management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>24/7 automated operation</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-black/20 rounded-2xl backdrop-blur-sm">
              <h4 className="font-bold mb-4 text-blue-200 text-lg">Investment Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">₹15K-25K</div>
                  <div className="text-sm text-blue-200">Setup Cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">₹500-1.5K</div>
                  <div className="text-sm text-blue-200">Monthly Hosting</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">2%</div>
                  <div className="text-sm text-blue-200">Transaction Fee</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">3-6 Months</div>
                  <div className="text-sm text-blue-200">ROI Timeline</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
