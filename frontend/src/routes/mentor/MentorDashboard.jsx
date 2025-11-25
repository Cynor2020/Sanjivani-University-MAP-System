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
  ResponsiveContainer
} from "recharts";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [divisionStats, setDivisionStats] = useState(null);
  const [deadlineStatus, setDeadlineStatus] = useState(null);

  // Fetch pending certificates for mentor's division
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingCertificatesMentor"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/pending/mentor?limit=5`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch division stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["divisionStats"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/department-stats?department=${encodeURIComponent(getUserDepartment())}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch deadline status
  const { data: deadlineData, isLoading: deadlineLoading } = useQuery({
    queryKey: ["deadlineStatus"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/deadlines/status`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (pendingData?.certificates) {
      setPendingCertificates(pendingData.certificates);
    }
  }, [pendingData]);

  useEffect(() => {
    if (statsData?.stats) {
      setDivisionStats(statsData.stats);
    }
  }, [statsData]);

  useEffect(() => {
    if (deadlineData) {
      setDeadlineStatus(deadlineData);
    }
  }, [deadlineData]);

  const getUserDepartment = () => {
    // In a real implementation, this would come from the user context
    return "Computer Engineering"; // Placeholder
  };

  const getUserDivision = () => {
    // In a real implementation, this would come from the user context
    return "A"; // Placeholder
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
      </div>

      {/* Deadline Status Banner */}
      {deadlineStatus && (
        <Card className={deadlineStatus.status === "active" && deadlineStatus.daysRemaining <= 3 ? "bg-red-100 border-red-300" : ""}>
          <CardContent className="p-4">
            {deadlineStatus.status === "no_academic_year" && (
              <p className="text-center text-yellow-600">No active academic year found. Please contact the Super Admin.</p>
            )}
            {deadlineStatus.status === "no_deadline" && (
              <p className="text-center text-yellow-600">No upload deadline set for your department yet.</p>
            )}
            {deadlineStatus.status === "expired" && (
              <p className="text-center text-red-600 font-bold">Certificate upload deadline has passed!</p>
            )}
            {deadlineStatus.status === "active" && (
              <div className="text-center">
                <p className="font-bold">
                  {deadlineStatus.daysRemaining > 3 
                    ? `Certificate upload deadline: ${deadlineStatus.daysRemaining} days remaining` 
                    : deadlineStatus.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Division Stats */}
      {statsLoading ? (
        <p>Loading division statistics...</p>
      ) : divisionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Students in Division</p>
              <p className="text-3xl font-bold text-blue-600">{divisionStats.totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Avg Points</p>
              <p className="text-3xl font-bold text-purple-600">{divisionStats.avgPoints}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Alumni</p>
              <p className="text-3xl font-bold text-green-600">{divisionStats.alumniCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Pending Clearance</p>
              <p className="text-3xl font-bold text-red-600">{divisionStats.pendingClearanceCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/mentor/pending")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Pending Certificates</h3>
            <p className="text-sm text-gray-500 mt-2">Review and approve pending certificates</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/mentor/students")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Student List</h3>
            <p className="text-sm text-gray-500 mt-2">View students and their passwords</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/hod/reports")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Division Reports</h3>
            <p className="text-sm text-gray-500 mt-2">View division analytics and reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pending Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <p>Loading pending certificates...</p>
          ) : pendingCertificates.length === 0 ? (
            <p className="text-center py-4">No pending certificates</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">Activity</th>
                    <th className="text-left p-4">Level</th>
                    <th className="text-left p-4">Submitted</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCertificates.map((cert) => (
                    <tr key={cert._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{cert.userId?.name}</div>
                          <div className="text-sm text-gray-500">{cert.userId?.enrollmentNumber}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{cert.categoryName}</div>
                        <div className="text-sm text-gray-500">{cert.title}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cert.level}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/mentor/pending?certId=${cert._id}`)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}