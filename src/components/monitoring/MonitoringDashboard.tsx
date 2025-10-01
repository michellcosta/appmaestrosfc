/**
 * Monitoring Dashboard Component
 * Dashboard completo de monitoramento e analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw,
  Download,
  Settings,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

export interface MonitoringData {
  analytics: {
    totalUsers: number;
    activeUsers: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    averageSessionDuration: number;
    conversionRate: number;
    revenue: number;
  };
  performance: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    speedIndex: number;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
    topErrors: Array<{
      message: string;
      count: number;
      percentage: number;
    }>;
    errorTrend: Array<{
      date: string;
      errors: number;
    }>;
  };
  behavior: {
    clicks: number;
    scrolls: number;
    keystrokes: number;
    mouseMovements: number;
    formInteractions: number;
    videoInteractions: number;
    searchQueries: number;
  };
  abTests: {
    activeTests: number;
    totalTests: number;
    conversions: number;
    revenue: number;
    topPerformingTest: string;
  };
  realTime: {
    activeUsers: number;
    pageViews: number;
    events: number;
    errors: number;
  };
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

interface MonitoringDashboardProps {
  data: MonitoringData;
  onRefresh: () => void;
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
  onConfigure: () => void;
  isLoading?: boolean;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  data,
  onRefresh,
  onExport,
  onConfigure,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'performance' | 'errors' | 'behavior' | 'abtests' | 'realtime'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        onRefresh();
      }, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh]);

  // Dados para gráficos
  const analyticsData = [
    { name: 'Users', value: data.analytics.totalUsers, color: '#8884d8' },
    { name: 'Sessions', value: data.analytics.sessions, color: '#82ca9d' },
    { name: 'Page Views', value: data.analytics.pageViews, color: '#ffc658' },
    { name: 'Conversions', value: data.analytics.conversionRate * 100, color: '#ff7300' }
  ];

  const performanceData = [
    { name: 'Page Load', value: data.performance.pageLoadTime, threshold: 3000 },
    { name: 'FCP', value: data.performance.firstContentfulPaint, threshold: 1800 },
    { name: 'LCP', value: data.performance.largestContentfulPaint, threshold: 2500 },
    { name: 'CLS', value: data.performance.cumulativeLayoutShift, threshold: 0.1 },
    { name: 'TTI', value: data.performance.timeToInteractive, threshold: 3800 }
  ];

  const errorTrendData = data.errors.errorTrend.map(item => ({
    date: item.date,
    errors: item.errors,
    rate: (item.errors / data.analytics.sessions) * 100
  }));

  const behaviorData = [
    { name: 'Clicks', value: data.behavior.clicks, color: '#8884d8' },
    { name: 'Scrolls', value: data.behavior.scrolls, color: '#82ca9d' },
    { name: 'Form Interactions', value: data.behavior.formInteractions, color: '#ffc658' },
    { name: 'Video Interactions', value: data.behavior.videoInteractions, color: '#ff7300' }
  ];

  const realTimeData = [
    { name: 'Active Users', value: data.realTime.activeUsers, color: '#8884d8' },
    { name: 'Page Views', value: data.realTime.pageViews, color: '#82ca9d' },
    { name: 'Events', value: data.realTime.events, color: '#ffc658' },
    { name: 'Errors', value: data.realTime.errors, color: '#ff7300' }
  ];

  const getStatusColor = (value: number, threshold: number) => {
    if (value <= threshold) return 'text-green-600';
    if (value <= threshold * 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, threshold: number) => {
    if (value <= threshold) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value <= threshold * 1.5) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitoramento em tempo real do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('json')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigure}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="abtests">A/B Tests</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                    <p className="text-2xl font-bold">{data.analytics.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                    <p className="text-2xl font-bold">{data.analytics.activeUsers.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Page Views</p>
                    <p className="text-2xl font-bold">{data.analytics.pageViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversion Rate</p>
                    <p className="text-2xl font-bold">{(data.analytics.conversionRate * 100).toFixed(2)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+3%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Core Web Vitals and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(metric.value, metric.threshold)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${getStatusColor(metric.value, metric.threshold)}`}>
                          {metric.value.toFixed(2)}ms
                        </span>
                        <span className="text-sm text-gray-500">
                          / {metric.threshold}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Overview</CardTitle>
                <CardDescription>Error rates and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Errors</span>
                    <span className="text-2xl font-bold text-red-600">
                      {data.errors.totalErrors.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Error Rate</span>
                    <span className="text-2xl font-bold text-red-600">
                      {data.errors.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Top Errors</h4>
                    {data.errors.topErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{error.message}</span>
                        <Badge variant="destructive">{error.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>User engagement and behavior metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Analytics</CardTitle>
                <CardDescription>Session duration and bounce rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Average Session Duration</span>
                    <span className="text-2xl font-bold">
                      {Math.floor(data.analytics.averageSessionDuration / 60)}m {Math.floor(data.analytics.averageSessionDuration % 60)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Bounce Rate</span>
                    <span className="text-2xl font-bold">
                      {(data.analytics.bounceRate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Revenue</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${data.analytics.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Core Web Vitals and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Trends</CardTitle>
              <CardDescription>Error rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={errorTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="errors" stroke="#ff7300" strokeWidth={2} />
                  <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior</CardTitle>
              <CardDescription>User interactions and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={behaviorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="abtests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Tests</p>
                    <p className="text-2xl font-bold">{data.abTests.activeTests}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tests</p>
                    <p className="text-2xl font-bold">{data.abTests.totalTests}</p>
                  </div>
                  <PieChartIcon className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversions</p>
                    <p className="text-2xl font-bold">{data.abTests.conversions}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</p>
                    <p className="text-2xl font-bold">${data.abTests.revenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {realTimeData.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.name}</p>
                      <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: metric.color + '20' }}>
                      <Activity className="w-4 h-4" style={{ color: metric.color }} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Live</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;



