import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  Cell
} from "recharts";

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const [departmentStats, setDepartmentStats] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/leaderboard?limit=10`, {
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

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Director Dashboard</h1>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/director/hods")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Manage HODs</h3>
            <p className="text-sm text-gray-500 mt-2">Create and manage HOD accounts</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/director/analytics")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">University Analytics</h3>
            <p className="text-sm text-gray-500 mt-2">View comprehensive reports</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/director/performance")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Performance vs Strength</h3>
            <p className="text-sm text-gray-500 mt-2">Analyze department performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance vs Strength Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Strength by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {performanceLoading ? (
            <p>Loading performance data...</p>
          ) : departmentStats.length > 0 ? (
            <div className="h-80">
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
          ) : (
            <p className="text-center py-4">No performance data available</p>
          )}
        </CardContent>
      </Card>

      {/* Top Students Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Students</CardTitle>
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
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Program</th>
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
                      <td className="p-4">{student.department}</td>
                      <td className="p-4">{student.program}</td>
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
    </div>
  );
}