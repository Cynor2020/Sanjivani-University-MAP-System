import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
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

export default function PerformanceVsStrength() {
  const [departmentStats, setDepartmentStats] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Fetch performance vs strength data
  const { data, isLoading } = useQuery({
    queryKey: ["performanceVsStrength"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/performance-vs-strength`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.performanceData) {
      setDepartmentStats(data.performanceData);
    }
  }, [data]);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performance vs Strength Analysis</h1>

      {/* Department Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Department Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border rounded p-2"
            >
              <option value="">All Departments</option>
              {departmentStats.map((dept, index) => (
                <option key={index} value={dept.department}>
                  {dept.department}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Performance vs Strength Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Strength by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading performance data...</p>
          ) : departmentStats.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedDepartment 
                    ? departmentStats.filter(d => d.department === selectedDepartment)
                    : departmentStats
                  }
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

      {/* Detailed Department Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Department Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading department statistics...</p>
          ) : departmentStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance Index
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentStats.map((dept, index) => (
                    <tr key={index} className={selectedDepartment && selectedDepartment === dept.department ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {dept.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {dept.studentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <span className="font-bold">{dept.avgPoints}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {dept.totalPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
          ) : (
            <p className="text-center py-4">No department statistics available</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading performance distribution...</p>
          ) : departmentStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <h3 className="text-lg font-semibold mb-4 text-center">Student Count Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats.map(dept => ({
                        name: dept.department,
                        value: dept.studentCount
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-80">
                <h3 className="text-lg font-semibold mb-4 text-center">Average Points Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats.map(dept => ({
                        name: dept.department,
                        value: dept.avgPoints
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center py-4">No performance distribution data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}