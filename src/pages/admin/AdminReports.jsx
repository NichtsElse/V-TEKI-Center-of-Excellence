import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, Award, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dummy data for MVP reports
const revenueData = [
  { month: 'Jan', revenue: 15000000, participants: 45 },
  { month: 'Feb', revenue: 22000000, participants: 60 },
  { month: 'Mar', revenue: 18000000, participants: 50 },
  { month: 'Apr', revenue: 35000000, participants: 95 },
  { month: 'May', revenue: 42000000, participants: 120 },
  { month: 'Jun', revenue: 58000000, participants: 155 },
];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Reports</h2>
        <p className="text-muted-foreground">Comprehensive overview of platform performance, revenue, and usage.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 190.000.000</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">525</div>
            <p className="text-xs text-slate-500">+35 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-500">3 new launched recently</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">480</div>
            <p className="text-xs text-slate-500">91% overall pass rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue & Enrollment Trends</CardTitle>
          <CardDescription>
            Monthly performance metrics for the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000000}M`} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  formatter={(value, name) => {
                    if (name === 'Revenue') return [`Rp ${value.toLocaleString()}`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="participants" name="Participants" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
