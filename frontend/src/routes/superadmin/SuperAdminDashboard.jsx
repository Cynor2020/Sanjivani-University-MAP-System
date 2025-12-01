import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { 
  Users, Award, Shield, Calendar, UserCheck, FolderOpen, 
  TrendingUp, BarChart3, FileText, GraduationCap
} from "lucide-react";

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

  // Fetch directors count
  const { data: directorsData } = useQuery({
    queryKey: ["directorsCount"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/directors`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch HODs count
  const { data: hodsData } = useQuery({
    queryKey: ["hodsCount"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/hods`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch departments count
  const { data: departmentsData } = useQuery({
    queryKey: ["departmentsCount"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
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
        setAcademicYear("");
      } else {
        toast.error(data.error || "Failed to start new academic year");
      }
    } catch (error) {
      toast.error("Failed to start new academic year");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage the entire system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Directors</p>
                <p className="text-3xl font-bold mt-2">{directorsData?.directors?.length || 0}</p>
              </div>
              <UserCheck className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">HODs</p>
                <p className="text-3xl font-bold mt-2">{hodsData?.hods?.length || 0}</p>
              </div>
              <Users className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold mt-2">{departmentsData?.departments?.length || 0}</p>
              </div>
              <FolderOpen className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Academic Year</p>
                <p className="text-xl font-bold mt-2">{academicYearData?.year || "Not Set"}</p>
              </div>
              <Calendar className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/manage-directors")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Manage Directors</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage directors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/manage-hods")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-green-100 rounded-xl group-hover:bg-green-200 transition">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Manage HODs</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage HODs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/manage-departments")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition">
                <FolderOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Manage Departments</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/manage-categories")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Manage Categories</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/start-year")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Start Academic Year</h3>
                <p className="text-sm text-gray-600 mt-1">Process student promotions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-red-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/audit")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-red-100 rounded-xl group-hover:bg-red-200 transition">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-600 mt-1">View system activity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-yellow-500 hover:shadow-xl transition-all duration-300"
          onClick={() => navigate("/superadmin/excellence")}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Excellence Awards</h3>
                <p className="text-sm text-gray-600 mt-1">Generate award reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Year Management */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span>Academic Year Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter new academic year (e.g., 2026-27)"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <Button 
              onClick={handleStartNewAcademicYear}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-xl shadow-lg"
            >
              Start New Academic Year
            </Button>
          </div>
          
          {academicYearLoading ? (
            <p className="text-gray-600">Loading current academic year...</p>
          ) : (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <p className="font-semibold text-lg text-gray-900">
                Current Academic Year: <span className="text-blue-600">{academicYearData?.year || "Not set"}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}