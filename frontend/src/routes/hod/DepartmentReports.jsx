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
  const [academicYear, setAcademicYear] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [students, setStudents] = useState([]);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [activeTab, setActiveTab] = useState("students");

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

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading, refetch: refetchStudents } = useQuery({
    queryKey: ["departmentStudents", academicYear, divisionFilter],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=student&department=${encodeURIComponent(getUserDepartment())}&division=${divisionFilter}&page=1&limit=100`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch department stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
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
    if (studentsData?.users) {
      setStudents(studentsData.users);
    }
  }, [studentsData]);

  useEffect(() => {
    if (statsData?.stats) {
      setDepartmentStats(statsData.stats);
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
              <label className="block text-sm font-medium mb-1">Academic Year</label>
              <input
                type="text"
                placeholder="e.g., 2025-26"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full border rounded p-2"
              />
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
                        <TableHead>Enrollment Number</TableHead>
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
                          <TableCell>{student.enrollmentNumber || "N/A"}</TableCell>
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