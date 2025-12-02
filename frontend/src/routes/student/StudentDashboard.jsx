import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import toast from "react-hot-toast";
import { 
  Upload, FileText, Download, ArrowRight, 
  Award, TrendingUp, CheckCircle, Clock, AlertCircle,
  User, FileCheck, CheckCircle2, XCircle
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch user progress
  const { data: progressDataRes, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/progress/${userData?.user?.id}`, {
        credentials: "include"
      });
      return res.json();
    },
    enabled: !!userData?.user?.id
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

  // Fetch student stats
  const { data: studentStatsData } = useQuery({
    queryKey: ["studentStats"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/stats`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (userData?.user) {
      setUser(userData.user);
    }
  }, [userData]);

  useEffect(() => {
    if (progressDataRes?.progress) {
      setProgressData(progressDataRes.progress);
    }
  }, [progressDataRes]);

  useEffect(() => {
    if (lockData) {
      setUploadStatus(lockData);
    }
  }, [lockData]);

  useEffect(() => {
    if (studentStatsData?.stats) {
      setStudentStats(studentStatsData.stats);
    }
  }, [studentStatsData]);

  // Timer effect for deadline countdown
  useEffect(() => {
    let timer;
    if (uploadStatus?.deadline && !uploadStatus.isActive) {
      const calculateTimeLeft = () => {
        const deadline = new Date(uploadStatus.deadline);
        const now = new Date();
        const difference = deadline.getTime() - now.getTime();
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          return { days, hours, minutes, seconds };
        }
        return null;
      };
      
      setTimeLeft(calculateTimeLeft());
      
      timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [uploadStatus]);

  if (userLoading || progressLoading) {
    return <LoadingSkeleton />;
  }

  // Get progress color
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "from-green-500 to-emerald-600";
    if (percentage >= 50) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  // Get badge class
  const getProgressBadgeClass = (percentage) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <div className="relative">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user?.name || "Student"} 
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || "Student"}!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user?.department && (
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-semibold text-gray-900">{user.department?.name || "N/A"}</p>
            </div>
          )}
          {user?.currentYear && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl border border-purple-200">
              <p className="text-sm text-gray-600">Year</p>
              <p className="font-semibold text-gray-900">{user.currentYear}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {studentStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm text-blue-100 font-medium uppercase tracking-wide">
                    Total Points
                  </p>
                  <p className="text-xl md:text-2xl font-bold mt-1 leading-tight">
                    {user?.totalPoints || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-blue-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm text-emerald-100 font-medium uppercase tracking-wide">
                    Certificates
                  </p>
                  <p className="text-xl md:text-2xl font-bold mt-1 leading-tight">
                    {studentStats.totalCertificates || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-emerald-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm text-amber-100 font-medium uppercase tracking-wide">
                    Pending
                  </p>
                  <p className="text-xl md:text-2xl font-bold mt-1 leading-tight">
                    {studentStats.pendingCertificates || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-amber-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm text-purple-100 font-medium uppercase tracking-wide">
                    Approved
                  </p>
                  <p className="text-xl md:text-2xl font-bold mt-1 leading-tight">
                    {studentStats.approvedCertificates || 0}
                  </p>
                </div>
                <div className="p-2 rounded-2xl bg-white/15">
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-purple-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Status Banner - Only show when upload is active or has a deadline */}
      {uploadStatus && (uploadStatus.isActive || uploadStatus.deadline) && (
        <Card className={`border-2 shadow-lg ${
          uploadStatus.isActive 
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" 
            : "bg-gradient-to-r from-red-50 to-orange-50 border-red-300"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {uploadStatus.isActive ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    Certificate Upload: {uploadStatus.isActive ? "Active" : "Disabled"}
                  </h3>
                  {!uploadStatus.isActive && uploadStatus.deadline && timeLeft && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Hurry up! Deadline approaching:
                      </p>
                      <div className="flex space-x-2 mt-1">
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                          {timeLeft.days}d
                        </div>
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                          {timeLeft.hours}h
                        </div>
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                          {timeLeft.minutes}m
                        </div>
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                          {timeLeft.seconds}s
                        </div>
                      </div>
                    </div>
                  )}
                  {uploadStatus.isActive && uploadStatus.deadline && (
                    <p className="text-sm text-gray-600 mt-1">
                      Deadline: {new Date(uploadStatus.deadline).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              {uploadStatus.isActive && (
                <Button 
                  onClick={() => navigate("/student/upload")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      {progressData && (
        <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Overall Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total Points</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {progressData.totalPoints || 0} / {progressData.requiredPoints || 200}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${getProgressColor(progressData.percentage || 0)} h-6 rounded-full transition-all duration-500 shadow-lg`}
                    style={{ width: `${Math.min(100, progressData.percentage || 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium text-gray-600">
                    {progressData.percentage || 0}% Complete
                  </span>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border-2 ${getProgressBadgeClass(progressData.percentage || 0)}`}>
                    {progressData.percentage >= 80 ? "Excellent" : progressData.percentage >= 50 ? "Good" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year-wise Progress */}
      {progressData?.yearWise && progressData.yearWise.length > 0 && (
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-purple-600" />
              <span>Year-wise Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {progressData.yearWise.map((yearData, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-center mb-3 text-gray-900 text-lg">Year {yearData.year}</h3>
                  <div className="text-center text-3xl font-bold mb-3 text-gray-900">
                    {yearData.points || 0} / {yearData.requiredPoints || 100}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`bg-gradient-to-r ${getProgressColor(yearData.percentage || 0)} h-3 rounded-full`}
                      style={{ width: `${Math.min(100, yearData.percentage || 0)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{yearData.percentage || 0}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getProgressBadgeClass(yearData.percentage || 0)}`}>
                      {yearData.status || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50"
          onClick={() => navigate("/student/upload")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Upload Certificate</h3>
            <p className="text-sm text-gray-600">Submit new certificates for approval</p>
            <ArrowRight className="h-5 w-5 text-blue-600 mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
        
        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50"
          onClick={() => navigate("/student/certificates")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">My Certificates</h3>
            <p className="text-sm text-gray-600">View your submitted certificates</p>
            <ArrowRight className="h-5 w-5 text-green-600 mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
        
        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50"
          onClick={() => navigate("/student/transcript")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Download className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Download Transcript</h3>
            <p className="text-sm text-gray-600">Get your official MAP transcript</p>
            <ArrowRight className="h-5 w-5 text-purple-600 mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
        
        <Card 
          className="group cursor-pointer border-2 border-transparent hover:border-amber-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50"
          onClick={() => navigate("/student/carry-forward")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Carry Forward</h3>
            <p className="text-sm text-gray-600">Request to carry forward points</p>
            <ArrowRight className="h-5 w-5 text-amber-600 mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}