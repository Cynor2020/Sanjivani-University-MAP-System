import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Users,
  Award,
  FileText,
  BarChart3,
  TrendingUp,
  Building2,
  Activity,
  ArrowRight,
  FolderOpen,
  Eye,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function DirectorDashboard() {
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: statsData } = useQuery({
    queryKey: ["directorDashboardStats"],
    queryFn: async () => {
      try {
        // Fetch total students
        const studentsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/all-students`, {
          credentials: "include",
        });
        const studentsData = await studentsRes.json();
        
        // Fetch departments
        const departmentsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
          credentials: "include",
        });
        const departmentsData = await departmentsRes.json();
        
        // Fetch categories
        const categoriesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
          credentials: "include",
        });
        const categoriesData = await categoriesRes.json();
        
        // Fetch certificates stats
        const certificatesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/stats`, {
          credentials: "include",
        });
        const certificatesData = await certificatesRes.json();
        
        return {
          totalStudents: studentsData?.pagination?.totalCount || 0,
          totalDepartments: departmentsData?.departments?.length || 0,
          totalCategories: categoriesData?.categories?.length || 0,
          totalCertificates: certificatesData?.total || 0,
          pendingCertificates: certificatesData?.pending || 0,
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
          totalStudents: 0,
          totalDepartments: 0,
          totalCategories: 0,
          totalCertificates: 0,
          pendingCertificates: 0,
        };
      }
    },
  });

  // Fetch latest approved certificates
  const { data: latestCertificatesData } = useQuery({
    queryKey: ["latestApprovedCertificatesDirector"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/latest-approved`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
            Director Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base max-w-2xl">
            University-wide view of MAP performance, departments and certificates — designed for
            quick strategic decisions.
          </p>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-blue-100 font-medium uppercase tracking-wide">
                  Total Students
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{statsData?.totalStudents || 0}</p>
                <p className="text-[11px] md:text-xs text-blue-100 mt-1">
                  Across all departments
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <Users className="h-7 w-7 md:h-8 md:w-8 text-blue-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-indigo-100 font-medium uppercase tracking-wide">
                  Activity Categories
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{statsData?.totalCategories || 0}</p>
                <p className="text-[11px] md:text-xs text-indigo-100 mt-1">
                  Different activity types
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <FolderOpen className="h-7 w-7 md:h-8 md:w-8 text-indigo-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-purple-100 font-medium uppercase tracking-wide">
                  Departments
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{statsData?.totalDepartments || 0}</p>
                <p className="text-[11px] md:text-xs text-purple-100 mt-1">
                  Academic departments
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <Building2 className="h-7 w-7 md:h-8 md:w-8 text-purple-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-emerald-100 font-medium uppercase tracking-wide">
                  Total Certificates
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{statsData?.totalCertificates || 0}</p>
                <p className="text-[11px] md:text-xs text-emerald-50 mt-1">
                  All certificates
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <FileText className="h-7 w-7 md:h-8 md:w-8 text-emerald-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-amber-100 font-medium uppercase tracking-wide">
                  Pending Certificates
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{statsData?.pendingCertificates || 0}</p>
                <p className="text-[11px] md:text-xs text-amber-50 mt-1">
                  Awaiting approval
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <Shield className="h-7 w-7 md:h-8 md:w-8 text-amber-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle section: left analytics style card + right quick actions / lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Analytics entry points */}
        <Card className="lg:col-span-2 border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              University Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div
                onClick={() => navigate("/director/university-analytics")}
                className="group cursor-pointer rounded-2xl border border-indigo-100 bg-white/70 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-50">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  University-wide Analytics
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  View MAP performance across all institutes and programmes.
                </p>
              </div>

              <div
                onClick={() => navigate("/director/performance-vs-strength")}
                className="group cursor-pointer rounded-2xl border border-blue-100 bg-white/70 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-blue-50">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Performance vs. Strength
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Compare department wise MAP points vs student strength.
                </p>
              </div>

              <div
                onClick={() => navigate("/director/top-weak-branches")}
                className="group cursor-pointer rounded-2xl border border-rose-100 bg-white/70 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-rose-50">
                    <TrendingUp className="h-5 w-5 text-rose-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Top & Weak Branches
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Identify best performing and at-risk branches for MAP.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick Actions */}
        <Card className="border border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              onClick={() => navigate("/director/pending-certificates")}
              className="group cursor-pointer rounded-xl border border-amber-100 bg-amber-50/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-amber-100">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                Review Pending Certificates
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Approve or reject student certificate submissions
              </p>
            </div>
            
            <div
              onClick={() => navigate("/director/approved-certificates")}
              className="group cursor-pointer rounded-xl border border-green-100 bg-green-50/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-green-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                Approved Certificates
              </p>
              <p className="text-xs text-gray-600 mt-1">
                View and manage approved certificates
              </p>
            </div>
            
            <div
              onClick={() => navigate("/director/manage-students")}
              className="group cursor-pointer rounded-xl border border-blue-100 bg-blue-50/50 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                Manage Students
              </p>
              <p className="text-xs text-gray-600 mt-1">
                View and manage student accounts university-wide
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Activity Section */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
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
      </div>
    </div>
  );
}