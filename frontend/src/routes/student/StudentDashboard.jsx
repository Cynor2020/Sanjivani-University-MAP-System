import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [deadlineStatus, setDeadlineStatus] = useState(null);
  const [user, setUser] = useState(null);

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/progress/${userData?.user?._id}`, {
        credentials: "include"
      });
      return res.json();
    },
    enabled: !!userData?.user?._id
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
    if (deadlineData) {
      setDeadlineStatus(deadlineData);
    }
  }, [deadlineData]);

  if (userLoading || progressLoading) {
    return <LoadingSkeleton />;
  }

  // Get badge class based on percentage
  const getProgressBadgeClass = (percentage) => {
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, track your academic progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              <span className="font-medium">{user?.program}</span> - Year {user?.currentYear}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Welcome, {user?.name}</h2>
                <p className="text-gray-600">
                  {user?.program} - Year {user?.currentYear} | {user?.department}
                </p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Enrollment Number</p>
              <p className="font-medium text-gray-900">{user?.enrollmentNumber || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadline Status Banner */}
      {deadlineStatus && (
        <Card className={`
          border-0 shadow-lg 
          ${deadlineStatus.status === "active" && deadlineStatus.daysRemaining <= 3 
            ? "bg-red-50 border border-red-200" 
            : deadlineStatus.status === "active" 
              ? "bg-green-50 border border-green-200" 
              : "bg-yellow-50 border border-yellow-200"}
        `}>
          <CardContent className="p-4">
            {deadlineStatus.status === "no_academic_year" && (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-center text-yellow-700 font-medium">No active academic year found. Please contact the administration.</p>
              </div>
            )}
            {deadlineStatus.status === "no_deadline" && (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-center text-yellow-700 font-medium">No upload deadline set for your department yet.</p>
              </div>
            )}
            {deadlineStatus.status === "expired" && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-bold">Certificate upload deadline has passed!</p>
                </div>
                <p className="text-sm text-red-600">You can no longer upload certificates for this academic year.</p>
              </div>
            )}
            {deadlineStatus.status === "active" && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-bold text-gray-900">
                    {deadlineStatus.daysRemaining > 3 
                      ? `Certificate upload deadline: ${deadlineStatus.daysRemaining} days remaining` 
                      : deadlineStatus.message}
                  </p>
                </div>
                {deadlineStatus.daysRemaining <= 3 && (
                  <Button 
                    className="mt-2"
                    onClick={() => navigate("/student/upload")}
                  >
                    Upload Certificate Now
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      {progressData && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Points</span>
                  <span className="text-sm font-medium text-gray-900">
                    {progressData.totalPoints} / {progressData.requiredPoints}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full progress-bar"
                    style={{ width: `${Math.min(100, progressData.percentage)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">{progressData.percentage}% Complete</span>
                  <span className={`badge ${getProgressBadgeClass(progressData.percentage)}`}>
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
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Year-wise Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {progressData.yearWise.map((yearData, index) => (
                <div key={index} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-center mb-3 text-gray-900">Year {yearData.year}</h3>
                  <div className="text-center text-2xl font-bold mb-2 text-gray-900">
                    {yearData.points} / {yearData.minRequired}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full progress-bar"
                      style={{ width: `${Math.min(100, yearData.percentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{yearData.percentage}%</span>
                    <span className={`badge text-xs ${getProgressBadgeClass(yearData.percentage)}`}>
                      {yearData.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="dashboard-grid">
        <Card 
          className="card-hover border-0 shadow-lg cursor-pointer" 
          onClick={() => navigate("/student/upload")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Upload Certificate</h3>
            <p className="text-sm text-gray-600 mt-2">Submit new certificates for approval</p>
          </CardContent>
        </Card>
        
        <Card 
          className="card-hover border-0 shadow-lg cursor-pointer" 
          onClick={() => navigate("/student/certificates")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900">My Certificates</h3>
            <p className="text-sm text-gray-600 mt-2">View your submitted certificates</p>
          </CardContent>
        </Card>
        
        <Card 
          className="card-hover border-0 shadow-lg cursor-pointer" 
          onClick={() => navigate("/student/transcript")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Download Transcript</h3>
            <p className="text-sm text-gray-600 mt-2">Get your official MAP transcript</p>
          </CardContent>
        </Card>
        
        <Card 
          className="card-hover border-0 shadow-lg cursor-pointer" 
          onClick={() => navigate("/student/carry-forward")}
        >
          <CardContent className="p-6 text-center">
            <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Carry Forward Request</h3>
            <p className="text-sm text-gray-600 mt-2">Request to carry forward points</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}