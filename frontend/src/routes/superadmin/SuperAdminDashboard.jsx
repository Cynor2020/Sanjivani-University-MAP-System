import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import {
  Users,
  Award,
  Shield,
  Calendar,
  UserCheck,
  FolderOpen,
  TrendingUp,
  BarChart3,
  FileText,
  GraduationCap,
  Eye,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState("");

  // Fetch current academic year
  const { data: academicYearData, isLoading: academicYearLoading } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/current`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch directors count
  const { data: directorsData } = useQuery({
    queryKey: ["directorsCount"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/directors`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch HODs count
  const { data: hodsData } = useQuery({
    queryKey: ["hodsCount"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/hods`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch departments count
  const { data: departmentsData } = useQuery({
    queryKey: ["departmentsCount"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch latest approved certificates
  const { data: latestCertificatesData } = useQuery({
    queryKey: ["latestApprovedCertificates"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/latest-approved`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  const handleStartNewAcademicYear = async () => {
    if (!academicYear) {
      toast.error("Please enter academic year");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to start academic year ${academicYear}? This will process all students.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ year: academicYear }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setAcademicYear("");
      } else {
        toast.error(data.error || "Failed to start new academic year");
      }
    } catch (error) {
      toast.error("Failed to start new academic year");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header strip similar to Materially top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Super Admin
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Central control panel for Sanjivani MAP system.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-700">System Healthy</span>
          </div>
        </div>
      </div>

      {/* Top metric cards row - stretch nicely on all screens */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-3.5 md:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] md:text-[11px] text-indigo-100 font-medium uppercase tracking-wide">
                  Directors
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                  {directorsData?.directors?.length || 0}
                </p>
              </div>
              <div className="p-2 rounded-2xl bg-white/15">
                <UserCheck className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-indigo-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-3.5 md:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] md:text-[11px] text-emerald-100 font-medium uppercase tracking-wide">
                  HODs
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                  {hodsData?.hods?.length || 0}
                </p>
              </div>
              <div className="p-2 rounded-2xl bg-white/15">
                <Users className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-emerald-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-purple-500 to-violet-600 text-white">
          <CardContent className="p-3.5 md:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] md:text-[11px] text-purple-100 font-medium uppercase tracking-wide">
                  Departments
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 md:mt-1 leading-tight">
                  {departmentsData?.departments?.length || 0}
                </p>
              </div>
              <div className="p-2 rounded-2xl bg-white/15">
                <FolderOpen className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-purple-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-3.5 md:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] md:text-[11px] text-amber-100 font-medium uppercase tracking-wide">
                  Academic Year
                </p>
                <p className="text-sm md:text-base lg:text-lg font-semibold mt-0.5 md:mt-1 leading-tight">
                  {academicYearData?.year || "Not Set"}
                </p>
              </div>
              <div className="p-2 rounded-2xl bg-white/15">
                <Calendar className="h-5 w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 text-amber-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle section: left analytics style card + right quick actions / lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: MAP overview (chart placeholder like Materially) */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3 md:pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                MAP Overview
              </CardTitle>
              <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                Demo layout for university-wide MAP performance (chart can be plugged here later).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[11px] md:text-xs px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                This Year
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-40 md:h-56 rounded-xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 border border-dashed border-indigo-100 flex items-center justify-center">
              <div className="text-center px-4">
                <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-indigo-300 mx-auto mb-2" />
                <p className="text-xs md:text-sm text-gray-500">
                  Chart placeholder &mdash; integrate real MAP analytics here for production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Latest activity + quick actions */}
        <div className="space-y-4 md:space-y-6">
          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                Latest Approved Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {latestCertificatesData?.certificates?.length > 0 ? (
                <div className="space-y-2">
                  {latestCertificatesData.certificates.map((cert) => (
                    <div key={cert.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs md:text-sm text-gray-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Activity: {cert.title}</p>
                          <p>Student: {cert.studentName} ({cert.studentPRN})</p>
                          <p className="text-gray-600 mt-1">
                            {new Date(cert.approvedAt).toLocaleDateString()} · Approved by {cert.approvedBy}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(cert.cloudinaryUrl, '_blank')}
                          className="ml-2 h-6 px-2 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No recent approved activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                Management Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 md:space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/superadmin/manage-directors")}
                className="w-full justify-between border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-xs md:text-sm"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  Manage Directors
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/superadmin/manage-hods")}
                className="w-full justify-between border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/60 text-xs md:text-sm"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Manage HODs
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/superadmin/manage-departments")}
                className="w-full justify-between border-gray-200 hover:border-purple-400 hover:bg-purple-50/60 text-xs md:text-sm"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-purple-600" />
                  Manage Departments
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/superadmin/manage-categories")}
                className="w-full justify-between border-gray-200 hover:border-blue-400 hover:bg-blue-50/60 text-xs md:text-sm"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Manage Categories
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/superadmin/audit")}
                className="w-full justify-between border-gray-200 hover:border-red-400 hover:bg-red-50/60 text-xs md:text-sm"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  Audit Logs
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional stats row: top department / top student / pending approvals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Top Department (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs md:text-sm">
            <p className="font-semibold text-gray-900">Computer Science & Engineering</p>
            <p className="text-gray-600">Overall MAP completion: 92%</p>
            <p className="text-gray-500">Demo data – connect to real analytics later.</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Award className="h-4 w-4 text-amber-600" />
              Top Student (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs md:text-sm">
            <p className="font-semibold text-gray-900">Demo Student Name</p>
            <p className="text-gray-600">Total MAP points: 145 / 150</p>
            <p className="text-gray-500">B.Tech CSE · 4th Year</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Shield className="h-4 w-4 text-red-600" />
              Pending Approvals (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs md:text-sm">
            <p className="font-semibold text-gray-900">Certificates awaiting clearance</p>
            <p className="text-gray-600">University-wide pending: 37</p>
            <p className="text-gray-500">Use audit or certificate APIs to drive this in future.</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Academic Year management strip like a settings widget */}
      <Card className="border border-gray-100 shadow-sm bg-gradient-to-r from-blue-50 via-white to-indigo-50">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            Academic Year Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <input
              type="text"
              placeholder="Enter new academic year (e.g., 2026-27)"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="flex-1 px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base transition"
            />
            <Button
              onClick={handleStartNewAcademicYear}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-sm md:text-base shadow-md"
            >
              Start New Academic Year
            </Button>
          </div>

          {academicYearLoading ? (
            <p className="text-xs md:text-sm text-gray-600">Loading current academic year...</p>
          ) : (
            <div className="mt-1 p-3 md:p-4 bg-white rounded-lg border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-semibold text-sm md:text-base text-gray-900">
                Current Academic Year:{" "}
                <span className="text-blue-600">{academicYearData?.year || "Not set"}</span>
              </p>
              <p className="text-[11px] md:text-xs text-gray-500">
                This card is styled for demo similar to Materially admin overview.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}