import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ProtectedRoute.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Users,
  FileCheck,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Settings,
  User as UserIcon,
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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/department-stats?department=${encodeURIComponent(
          user.department,
        )}`,
        {
          credentials: "include",
        },
      );
      return res.json();
    },
    enabled: !!user?.department,
  });

  // Fetch pending certificates
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingCertificatesHOD"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/pending/hod?limit=5`,
        {
          credentials: "include",
        },
      );
      return res.json();
    },
  });

  // Fetch upload lock status
  const { data: lockData } = useQuery({
    queryKey: ["uploadLockStatus"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload-lock/status`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch latest department students for dashboard
  const { data: latestStudentsData, isLoading: latestStudentsLoading } = useQuery({
    queryKey: ["departmentStudentsLatest"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/department-students?limit=50`,
        {
          credentials: "include",
        },
      );
      return res.json();
    },
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

  const latestStudents = (() => {
    const list = latestStudentsData?.students || [];
    return [...list]
      .filter((s) => !!s.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  })();

  const effectiveStats = departmentStats || statsData?.stats || statsData || null;

  const yearWise = effectiveStats?.yearWise || [];

  const topStripStats = (() => {
    const totalStudents = effectiveStats?.totalStudents || 0;
    const totalCertificates = effectiveStats?.totalCertificates || 0;
    const pendingClearance = effectiveStats?.pendingClearanceCount || 0;
    const approvedCertificates = Math.max(totalCertificates - pendingClearance, 0);
    const alumniCount = departmentStats?.alumniCount || 0;
    const pendingNow = pendingCertificates.length || 0;

    return {
      totalStudents,
      totalCertificates,
      pendingClearance,
      approvedCertificates,
      alumniCount,
      pendingNow,
    };
  })();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with profile on right */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            HOD Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Department overview, students and certificate activity at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user?.name || "HOD"}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover shadow-md border-2 border-white"
            />
          ) : (
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm md:text-lg font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || "H"}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm md:text-base font-semibold text-gray-900">
              {user?.name || "HOD"}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[180px]">
              {user?.department?.name || "Department HOD"}
            </p>
          </div>
        </div>
      </div>

      {/* Compact stats strip at top (quick counts) */}
      {effectiveStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            <p className="text-[10px] md:text-xs text-blue-600 font-medium uppercase tracking-wide">
              Total Students
            </p>
            <p className="text-sm md:text-base font-semibold text-blue-900">
              {topStripStats.totalStudents}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
            <p className="text-[10px] md:text-xs text-emerald-600 font-medium uppercase tracking-wide">
              Total Certificates
            </p>
            <p className="text-sm md:text-base font-semibold text-emerald-900">
              {topStripStats.totalCertificates}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
            <p className="text-[10px] md:text-xs text-amber-700 font-medium uppercase tracking-wide">
              Pending Certificates
            </p>
            <p className="text-sm md:text-base font-semibold text-amber-900">
              {topStripStats.pendingNow}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2">
            <p className="text-[10px] md:text-xs text-green-700 font-medium uppercase tracking-wide">
              Approved (Est.)
            </p>
            <p className="text-sm md:text-base font-semibold text-green-900">
              {topStripStats.approvedCertificates}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 border border-purple-100 px-3 py-2">
            <p className="text-[10px] md:text-xs text-purple-700 font-medium uppercase tracking-wide">
              Alumni
            </p>
            <p className="text-sm md:text-base font-semibold text-purple-900">
              {topStripStats.alumniCount}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
            <p className="text-[10px] md:text-xs text-gray-600 font-medium uppercase tracking-wide">
              Avg Points
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-900">
              {Math.round(effectiveStats.avgPoints || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Upload Status Banner */}
      {deadlineStatus && (
        <Card
          className={`border-2 shadow-lg ${
            deadlineStatus.isActive
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
              : "bg-gradient-to-r from-red-50 to-orange-50 border-red-300"
          }`}
        >
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                {deadlineStatus.isActive ? (
                  <CheckCircle className="h-7 w-7 md:h-8 md:w-8 text-green-600" />
                ) : (
                  <XCircle className="h-7 w-7 md:h-8 md:w-8 text-red-600" />
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Certificate Upload Window
                  </p>
                  <h3 className="font-bold text-base md:text-lg text-gray-900">
                    {deadlineStatus.isActive ? "Active" : "Closed"}
                  </h3>
                  {deadlineStatus.deadline && (
                    <p className="text-xs md:text-sm text-gray-700 mt-1">
                      Deadline:{" "}
                      <span className="font-medium">
                        {new Date(deadlineStatus.deadline).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  onClick={() => navigate("/hod/toggle-upload")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 md:px-5"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 md:p-6">
                <div className="h-16 md:h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : effectiveStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-3.5 md:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] md:text-[11px] text-blue-100 font-medium uppercase tracking-wide">
                    Total Students
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                    {effectiveStats.totalStudents || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <Users className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-3.5 md:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] md:text-[11px] text-emerald-100 font-medium uppercase tracking-wide">
                    Total Certificates (Demo)
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                    {effectiveStats.totalCertificates || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <FileCheck className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-emerald-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-3.5 md:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] md:text-[11px] text-red-100 font-medium uppercase tracking-wide">
                    Pending Clearance
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                    {effectiveStats.pendingClearanceCount || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <Clock className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-red-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-lg hover:shadow-xl transition">
            <CardContent className="p-3.5 md:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] md:text-[11px] text-purple-100 font-medium uppercase tracking-wide">
                    Avg Points / Student
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                    {Math.round(effectiveStats.avgPoints || 0)}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <TrendingUp className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-purple-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Year-wise summary (uses optional yearWise structure if backend provides it) */}
      {yearWise.length > 0 && (
        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Calendar className="h-4 w-4 text-green-600" />
              Year-wise Summary (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {yearWise.map((y, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl p-3 md:p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="text-xs text-gray-500 mb-1">Year</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                    {y.yearLabel || y.year || `Year ${idx + 1}`}
                  </p>
                  <p className="text-xs md:text-sm text-gray-700">
                    Students:{" "}
                    <span className="font-semibold">
                      {y.studentCount ?? y.students ?? 0}
                    </span>
                  </p>
                  <p className="text-xs md:text-sm text-gray-700">
                    Uploads:{" "}
                    <span className="font-semibold">
                      {y.uploadCount ?? y.certificates ?? 0}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Recent Pending Certificates + Latest Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
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
                            <div className="font-semibold text-gray-900">
                              {cert.userId?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cert.userId?.prn ||
                                cert.userId?.enrollmentNumber ||
                                "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {cert.categoryName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cert.title || "N/A"}
                          </div>
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
                    <Button variant="outline" onClick={() => navigate("/hod/pending")}>
                      View All Pending Certificates
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <UserIcon className="h-5 w-5 text-purple-600" />
              Latest Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestStudentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : latestStudents.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                No students found for this department yet.
              </div>
            ) : (
              <div className="space-y-3">
                {latestStudents.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 hover:bg-purple-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                        {s.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {s.prn || s.enrollmentNumber || ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-500">
                        {s.currentYear || "Year N/A"}
                      </p>
                      {s.createdAt && (
                        <p className="text-[10px] text-gray-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
