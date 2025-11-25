import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState("");

  // Fetch current academic year
  const { data: academicYearData, isLoading: academicYearLoading } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/current`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch academic year stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["academicYearStats"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/stats`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch audit stats
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["auditStats"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audit/stats`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  const handleStartNewAcademicYear = async () => {
    if (!academicYear) {
      toast.error("Please enter academic year");
      return;
    }

    if (!window.confirm(`Are you sure you want to start academic year ${academicYear}? This will process all students.`)) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ year: academicYear })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        // Refresh data
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to start new academic year");
      }
    } catch (error) {
      toast.error("Failed to start new academic year");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      </div>

      {/* Academic Year Section */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter new academic year (e.g., 2026-27)"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="border rounded p-2"
            />
            <Button onClick={handleStartNewAcademicYear}>
              Start New Academic Year
            </Button>
          </div>
          
          {academicYearLoading ? (
            <p>Loading current academic year...</p>
          ) : (
            <div className="mt-4">
              <p className="font-semibold">
                Current Academic Year: {academicYearData?.year || "Not set"}
              </p>
            </div>
          )}
          
          {statsLoading ? (
            <p>Loading statistics...</p>
          ) : statsData?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-100 p-4 rounded">
                <p className="text-sm text-blue-800">Total Students</p>
                <p className="text-2xl font-bold">{statsData.stats.totalStudents}</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <p className="text-sm text-green-800">Graduated Students</p>
                <p className="text-2xl font-bold">{statsData.stats.graduatedStudents}</p>
              </div>
              <div className="bg-red-100 p-4 rounded">
                <p className="text-sm text-red-800">Pending Clearance</p>
                <p className="text-2xl font-bold">{statsData.stats.pendingClearanceStudents}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/superadmin/start-year")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Start New Academic Year</h3>
            <p className="text-sm text-gray-500 mt-2">Process student promotions</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/superadmin/audit")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Audit Logs</h3>
            <p className="text-sm text-gray-500 mt-2">View system activity</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/superadmin/excellence")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Excellence Awards</h3>
            <p className="text-sm text-gray-500 mt-2">Generate award reports</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/superadmin/reports")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">University Reports</h3>
            <p className="text-sm text-gray-500 mt-2">View comprehensive reports</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/superadmin/create-student")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Create Student</h3>
            <p className="text-sm text-gray-500 mt-2">Add new student account</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/superadmin/set-student-password")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Set Student Password</h3>
            <p className="text-sm text-gray-500 mt-2">Set password for existing student</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Stats */}
      {auditLoading ? (
        <p>Loading audit statistics...</p>
      ) : auditData?.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-100 p-4 rounded">
                <p className="text-sm text-purple-800">Total Logs</p>
                <p className="text-2xl font-bold">{auditData.stats.totalCount}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <p className="text-sm text-yellow-800">Recent Activity (24h)</p>
                <p className="text-2xl font-bold">{auditData.stats.recentCount}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded">
                <p className="text-sm text-indigo-800">Top Action</p>
                <p className="text-2xl font-bold">
                  {auditData.stats.topActions[0]?._id || "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}