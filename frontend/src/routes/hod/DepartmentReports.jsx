import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function DepartmentReports() {
  const [departmentYear, setDepartmentYear] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [students, setStudents] = useState([]);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [activeTab, setActiveTab] = useState("students");
  const [departmentYears, setDepartmentYears] = useState([]);

  // Fetch department years for HOD
  const { data: departmentYearsData } = useQuery({
    queryKey: ["departmentYears"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/department-years`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (departmentYearsData?.department?.years) {
      setDepartmentYears(departmentYearsData.department.years);
    }
  }, [departmentYearsData]);

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useQuery({
    queryKey: ["departmentStudents", departmentYear, divisionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", "student");
      if (departmentYear) params.append("year", departmentYear);
      if (divisionFilter) params.append("division", divisionFilter);
      params.append("page", "1");
      params.append("limit", "100");
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?${params}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch department stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["departmentStats", departmentYear],
    queryFn: async () => {
      // We'll need to update this to use department year instead of academic year
      // For now, we'll pass the department year as a parameter
      const params = new URLSearchParams();
      if (departmentYear) params.append("year", departmentYear);
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/department?${params}`, {
        credentials: "include"
      });
      return res.json();
    },
    enabled: !!departmentYear
  });

  useEffect(() => {
    if (studentsData?.users) {
      setStudents(studentsData.users);
    }
  }, [studentsData]);

  useEffect(() => {
    if (statsData?.stats) {
      setDepartmentStats(statsData.stats);
    }
  }, [statsData]);

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (departmentYear) params.append("year", departmentYear);
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/department/export?${params}`, {
        credentials: "include"
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `department_report_${departmentYear || 'all'}.csv`;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Department Reports</h1>
        <Button onClick={exportToCSV} variant="outline">
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department Year</label>
              <select
                value={departmentYear}
                onChange={(e) => setDepartmentYear(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">All Years</option>
                {departmentYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Division</label>
              <input
                type="text"
                placeholder="Filter by division"
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => { refetchStudents(); }}>
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("students")}
          >
            Student List
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "students" && (
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <p>Loading students...</p>
              ) : students.length === 0 ? (
                <p className="text-center py-4">No students found</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PRN</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Total Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.prn || "N/A"}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.division}</TableCell>
                          <TableCell>{student.program}</TableCell>
                          <TableCell>{student.currentYear}</TableCell>
                          <TableCell>
                            <span className="font-bold">{student.totalPoints || 0}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Department Stats */}
            {statsLoading ? (
              <p>Loading department statistics...</p>
            ) : departmentStats && (
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
                    <p className="text-3xl font-bold text-green-600">{departmentStats.certificates?.approved || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">Pending Certificates</p>
                    <p className="text-3xl font-bold text-yellow-600">{departmentStats.certificates?.pending || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500">Rejected Certificates</p>
                    <p className="text-3xl font-bold text-red-600">{departmentStats.certificates?.rejected || 0}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Certificate Analytics Chart */}
            {departmentStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Approved', count: departmentStats.certificates?.approved || 0 },
                          { name: 'Pending', count: departmentStats.certificates?.pending || 0 },
                          { name: 'Rejected', count: departmentStats.certificates?.rejected || 0 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Certificate Count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}