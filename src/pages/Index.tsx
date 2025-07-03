
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
  Clock
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AutoPrint College</h1>
                <p className="text-sm text-gray-600">WhatsApp-Based Automated Printing System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Revolutionary College Printing Solution
          </h2>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Send files via WhatsApp, pay instantly, and get your documents printed automatically. 
            No queues, no waiting, no hassle.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Smartphone className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold mb-2">WhatsApp Integration</h3>
                <p className="text-sm text-gray-600">Send files directly through WhatsApp</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <h3 className="font-semibold mb-2">Instant Processing</h3>
                <p className="text-sm text-gray-600">Automated file processing and pricing</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600">UPI and digital payment integration</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">24/7 Available</h3>
                <p className="text-sm text-gray-600">Print anytime, collect anytime</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat Demo
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Queue
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <div className="max-w-2xl mx-auto">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-center">WhatsApp Bot Simulation</CardTitle>
                  <p className="text-center text-gray-600">
                    Try uploading a file or typing commands like "status" or "confirm"
                  </p>
                </CardHeader>
              </Card>
              <ChatInterface />
            </div>
          </TabsContent>
          
          <TabsContent value="queue">
            <PrintQueue />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
        </Tabs>

        {/* Technical Implementation Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Implementation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Core Technologies</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>whatsapp-web.js:</strong> WhatsApp automation</li>
                  <li>• <strong>Node.js + Express:</strong> Backend server</li>
                  <li>• <strong>pdf-lib.js:</strong> PDF processing and page counting</li>
                  <li>• <strong>node-printer:</strong> Direct printer integration</li>
                  <li>• <strong>Razorpay/UPI:</strong> Payment processing</li>
                  <li>• <strong>SQLite/MongoDB:</strong> Transaction logging</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Key Features</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Automatic page counting and cost calculation</li>
                  <li>• Real-time payment verification</li>
                  <li>• Print queue management</li>
                  <li>• File format validation and security</li>
                  <li>• Admin dashboard for monitoring</li>
                  <li>• 24/7 automated operation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800">Implementation Cost Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Setup Cost:</strong><br />
                  ₹15,000 - ₹25,000
                </div>
                <div>
                  <strong>Monthly Hosting:</strong><br />
                  ₹500 - ₹1,500
                </div>
                <div>
                  <strong>Payment Gateway:</strong><br />
                  2% per transaction
                </div>
                <div>
                  <strong>ROI Timeline:</strong><br />
                  3-6 months
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
