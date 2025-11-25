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

export default function AnalyticsDepartment() {
  const [academicYear, setAcademicYear] = useState("");
  const [departmentStats, setDepartmentStats] = useState(null);
  const [certificateStats, setCertificateStats] = useState(null);
  const [topCategories, setTopCategories] = useState([]);

  // Fetch current academic year
  const { data: academicYearData } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/current`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (academicYearData?.year) {
      setAcademicYear(academicYearData.year);
    }
  }, [academicYearData]);

  // Fetch department stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["departmentStats", academicYear],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/department?department=${encodeURIComponent(getUserDepartment())}&academicYear=${academicYear}`, {
        credentials: "include"
      });
      return res.json();
    },
    enabled: !!academicYear
  });

  useEffect(() => {
    if (statsData?.stats) {
      setDepartmentStats(statsData.stats);
      setCertificateStats(statsData.stats.certificates);
      setTopCategories(statsData.stats.topCategories || []);
    }
  }, [statsData]);

  const getUserDepartment = () => {
    // In a real implementation, this would come from the user context
    return "Computer Engineering"; // Placeholder
  };

  const exportToCSV = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/department/export?department=${encodeURIComponent(getUserDepartment())}&academicYear=${academicYear}`, {
        credentials: "include"
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `department_${getUserDepartment()}_report.csv`;
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
        <h1 className="text-3xl font-bold">Department Analytics</h1>
        <Button onClick={exportToCSV} variant="outline">
          Export to CSV
        </Button>
      </div>

      {/* Academic Year Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Academic Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter academic year (e.g., 2025-26)"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="border rounded p-2"
            />
            <Button onClick={refetchStats}>Apply Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Department Stats */}
      {statsLoading ? (
        <p>Loading department statistics...</p>
      ) : departmentStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{departmentStats.totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Approved Certificates</p>
              <p className="text-3xl font-bold text-green-600">{certificateStats?.approved || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Pending Certificates</p>
              <p className="text-3xl font-bold text-yellow-600">{certificateStats?.pending || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Rejected Certificates</p>
              <p className="text-3xl font-bold text-red-600">{certificateStats?.rejected || 0}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Certificate Statistics */}
      {certificateStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: certificateStats.approved },
                        { name: 'Pending', value: certificateStats.pending },
                        { name: 'Rejected', value: certificateStats.rejected }
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
                        { name: 'Approved', value: certificateStats.approved },
                        { name: 'Pending', value: certificateStats.pending },
                        { name: 'Rejected', value: certificateStats.rejected }
                      ].map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Approved' ? '#10B981' : 
                            entry.name === 'Pending' ? '#F59E0B' : 
                            '#EF4444'
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Activity Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategories}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Certificate Count" fill="#8884d8" />
                    <Bar dataKey="totalPoints" name="Total Points" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Categories Table */}
      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Activity Categories Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Certificates</th>
                    <th className="text-left p-4">Total Points</th>
                    <th className="text-left p-4">Avg Points per Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories.map((category, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{category._id}</td>
                      <td className="p-4">{category.count}</td>
                      <td className="p-4">{category.totalPoints}</td>
                      <td className="p-4">
                        {category.count > 0 
                          ? (category.totalPoints / category.count).toFixed(2) 
                          : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}