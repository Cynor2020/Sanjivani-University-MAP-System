import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

export default function UniversityAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [summaryData, setSummaryData] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  // Fetch university summary
  const { data: summaryDataRes, isLoading: summaryLoading } = useQuery({
    queryKey: ["universitySummary"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/university`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch performance vs strength data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["performanceVsStrength"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/performance-vs-strength`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch student leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["studentLeaderboard"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/leaderboard?limit=20`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (summaryDataRes?.summary) {
      setSummaryData(summaryDataRes.summary);
    }
  }, [summaryDataRes]);

  useEffect(() => {
    if (performanceData?.performanceData) {
      setDepartmentStats(performanceData.performanceData);
    }
  }, [performanceData]);

  useEffect(() => {
    if (leaderboardData?.students) {
      setTopStudents(leaderboardData.students);
    }
  }, [leaderboardData]);

  const exportToCSV = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/university/export`, {
        credentials: "include"
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'university_report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Report exported successfully");
      } else {
        toast.error("Failed to export report");
      }
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">University Analytics</h1>
        <Button onClick={exportToCSV} variant="outline">
          Export to CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <p>Loading summary...</p>
      ) : summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{summaryData.totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Alumni</p>
              <p className="text-3xl font-bold text-green-600">{summaryData.totalAlumni}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Pending Clearance</p>
              <p className="text-3xl font-bold text-red-600">{summaryData.totalPendingClearance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Avg Points</p>
              <p className="text-3xl font-bold text-purple-600">{summaryData.avgPoints}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "performance"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("performance")}
          >
            Performance Analysis
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "leaderboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Student Leaderboard
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>University Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Certificate Statistics</h3>
                    {summaryLoading ? (
                      <p>Loading...</p>
                    ) : summaryData && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Certificates</span>
                          <span className="font-bold">{summaryData.totalCertificates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approved</span>
                          <span className="font-bold text-green-600">{summaryData.approvedCertificates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="font-bold text-yellow-600">{summaryData.pendingCertificates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejected</span>
                          <span className="font-bold text-red-600">{summaryData.rejectedCertificates}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Student Status Distribution</h3>
                    {summaryData && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Active', value: summaryData.totalStudents },
                              { name: 'Alumni', value: summaryData.totalAlumni },
                              { name: 'Pending Clearance', value: summaryData.totalPendingClearance }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Active', value: summaryData.totalStudents },
                              { name: 'Alumni', value: summaryData.totalAlumni },
                              { name: 'Pending Clearance', value: summaryData.totalPendingClearance }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "performance" && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <p>Loading performance data...</p>
              ) : departmentStats.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="studentCount" name="Student Count" fill="#8884d8" />
                        <Bar dataKey="avgPoints" name="Average Points" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Department</th>
                          <th className="text-left p-4">Student Count</th>
                          <th className="text-left p-4">Avg Points</th>
                          <th className="text-left p-4">Total Points</th>
                          <th className="text-left p-4">Performance Index</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((dept, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{dept.department}</td>
                            <td className="p-4">{dept.studentCount}</td>
                            <td className="p-4">
                              <span className="font-bold">{dept.avgPoints}</span>
                            </td>
                            <td className="p-4">{dept.totalPoints}</td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <span className="mr-2">{dept.performanceIndex}</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, dept.performanceIndex)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4">No performance data available</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "leaderboard" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <p>Loading leaderboard...</p>
              ) : topStudents.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Rank</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Department</th>
                        <th className="text-left p-4">Program</th>
                        <th className="text-left p-4">Year</th>
                        <th className="text-left p-4">Total Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((student, index) => (
                        <tr key={student._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-amber-100 text-amber-800' :
                              'bg-white'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-4 font-medium">{student.name}</td>
                          <td className="p-4">{student.email}</td>
                          <td className="p-4">{student.department}</td>
                          <td className="p-4">{student.program}</td>
                          <td className="p-4">{student.currentYear}</td>
                          <td className="p-4">
                            <span className="font-bold">{student.totalPoints}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4">No leaderboard data available</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}