import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ProtectedRoute.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { 
  Users, FileCheck, Calendar, BarChart3, Clock, 
  CheckCircle, XCircle, TrendingUp, Award, Settings
} from "lucide-react";

export default function HODDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departmentStats, setDepartmentStats] = useState(null);
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [deadlineStatus, setDeadlineStatus] = useState(null);

  // Fetch department stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["departmentStats"],
    queryFn: async () => {
      if (!user?.department) return {};
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/department-stats?department=${encodeURIComponent(user.department)}`, {
        credentials: "include"
      });
      return res.json();
    },
    enabled: !!user?.department
  });

  // Fetch pending certificates
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingCertificatesHOD"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/pending/hod?limit=5`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch upload lock status
  const { data: lockData } = useQuery({
    queryKey: ["uploadLockStatus"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-lock/status`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (statsData?.stats) {
      setDepartmentStats(statsData.stats);
    }
  }, [statsData]);

  useEffect(() => {
    if (pendingData?.certificates) {
      setPendingCertificates(pendingData.certificates);
    }
  }, [pendingData]);

  useEffect(() => {
    if (lockData) {
      setDeadlineStatus(lockData);
    }
  }, [lockData]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            HOD Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your department efficiently</p>
        </div>
      </div>

      {/* Upload Status Banner */}
      {deadlineStatus && (
        <Card className={`border-2 shadow-lg ${
          deadlineStatus.isActive 
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" 
            : "bg-gradient-to-r from-red-50 to-orange-50 border-red-300"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {deadlineStatus.isActive ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    Certificate Upload: {deadlineStatus.isActive ? "Active" : "Inactive"}
                  </h3>
                  {deadlineStatus.deadline && (
                    <p className="text-sm text-gray-600">
                      Deadline: {new Date(deadlineStatus.deadline).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => navigate("/hod/toggle-upload")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : departmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold mt-2">{departmentStats.totalStudents || 0}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Alumni</p>
                  <p className="text-3xl font-bold mt-2">{departmentStats.alumniCount || 0}</p>
                </div>
                <Award className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Pending Clearance</p>
                  <p className="text-3xl font-bold mt-2">{departmentStats.pendingClearanceCount || 0}</p>
                </div>
                <Clock className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Points</p>
                  <p className="text-3xl font-bold mt-2">{Math.round(departmentStats.avgPoints || 0)}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/hod/toggle-upload")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Toggle Upload</h3>
                <p className="text-sm text-gray-600 mt-1">Enable/disable certificate uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/hod/pending")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-green-100 rounded-xl group-hover:bg-green-200 transition">
                <FileCheck className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Pending Certificates</h3>
                <p className="text-sm text-gray-600 mt-1">Review and approve certificates</p>
                {pendingData?.certificates?.length > 0 && (
                  <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                    {pendingData.certificates.length} pending
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/hod/students")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Manage Students</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage department students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/hod/analytics")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">View department analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pending Certificates */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="h-6 w-6 text-blue-600" />
            <span>Recent Pending Certificates</span>
            {pendingData?.certificates?.length > 0 && (
              <span className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                {pendingData.certificates.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pending certificates...</p>
            </div>
          ) : pendingCertificates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">No pending certificates</p>
              <p className="text-sm text-gray-500 mt-1">All certificates have been reviewed</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Activity</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Level</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Submitted</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCertificates.map((cert) => (
                    <tr key={cert._id} className="border-b hover:bg-blue-50 transition">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-gray-900">{cert.userId?.name || "N/A"}</div>
                          <div className="text-sm text-gray-500">{cert.userId?.prn || cert.userId?.enrollmentNumber || "N/A"}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{cert.categoryName || "N/A"}</div>
                        <div className="text-sm text-gray-500">{cert.title || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {cert.level || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/hod/pending?certId=${cert._id}`)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingCertificates.length >= 5 && (
                <div className="p-4 bg-gray-50 text-center border-t">
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/hod/pending")}
                  >
                    View All Pending Certificates
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
