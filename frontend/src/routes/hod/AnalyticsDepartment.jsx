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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDepartment() {
  const { data, isLoading } = useQuery({
    queryKey: ["departmentAnalytics"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/department-analytics`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Department Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive analytics for your department</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Department Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Students:</span>
                <span className="font-bold text-lg">{data?.stats?.totalStudents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Points:</span>
                <span className="font-bold text-lg">{data?.stats?.avgPoints || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Students */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">PRN</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Points</th>
                </tr>
              </thead>
              <tbody>
                {data?.topStudents?.map((student, idx) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold">#{idx + 1}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.prn}</td>
                    <td className="p-3">{student.currentYear}</td>
                    <td className="p-3 font-semibold text-blue-600">{student.totalPoints || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weak Students */}
      <Card>
        <CardHeader>
          <CardTitle>Students Needing Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">PRN</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Points</th>
                </tr>
              </thead>
              <tbody>
                {data?.weakStudents?.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.prn}</td>
                    <td className="p-3">{student.currentYear}</td>
                    <td className="p-3 font-semibold text-red-600">{student.totalPoints || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category-wise Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.categoryStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
              <Bar dataKey="totalPoints" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
