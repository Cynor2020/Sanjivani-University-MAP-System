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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
              <p className="text-gray-600">
                {user?.program} - Year {user?.currentYear} | {user?.department}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Enrollment Number</p>
              <p className="font-medium">{user?.enrollmentNumber || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadline Status Banner */}
      {deadlineStatus && (
        <Card className={deadlineStatus.status === "active" && deadlineStatus.daysRemaining <= 3 ? "bg-red-100 border-red-300" : ""}>
          <CardContent className="p-4">
            {deadlineStatus.status === "no_academic_year" && (
              <p className="text-center text-yellow-600">No active academic year found. Please contact the administration.</p>
            )}
            {deadlineStatus.status === "no_deadline" && (
              <p className="text-center text-yellow-600">No upload deadline set for your department yet.</p>
            )}
            {deadlineStatus.status === "expired" && (
              <div className="text-center">
                <p className="text-red-600 font-bold">Certificate upload deadline has passed!</p>
                <p className="text-sm text-red-500">You can no longer upload certificates for this academic year.</p>
              </div>
            )}
            {deadlineStatus.status === "active" && (
              <div className="text-center">
                <p className="font-bold">
                  {deadlineStatus.daysRemaining > 3 
                    ? `Certificate upload deadline: ${deadlineStatus.daysRemaining} days remaining` 
                    : deadlineStatus.message}
                </p>
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
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Total Points</span>
                  <span className="text-sm font-medium">
                    {progressData.totalPoints} / {progressData.requiredPoints}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${Math.min(100, progressData.percentage)}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {progressData.percentage}% Complete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year-wise Progress */}
      {progressData?.yearWise && progressData.yearWise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Year-wise Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {progressData.yearWise.map((yearData, index) => (
                <div key={index} className="border rounded p-4">
                  <h3 className="font-semibold text-center mb-2">Year {yearData.year}</h3>
                  <div className="text-center text-2xl font-bold mb-2">
                    {yearData.points} / {yearData.minRequired}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, yearData.percentage)}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    {yearData.percentage}% Complete
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/student/upload")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Upload Certificate</h3>
            <p className="text-sm text-gray-500 mt-2">Submit new certificates for approval</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/student/certificates")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">My Certificates</h3>
            <p className="text-sm text-gray-500 mt-2">View your submitted certificates</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/student/transcript")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Download Transcript</h3>
            <p className="text-sm text-gray-500 mt-2">Get your official MAP transcript</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/student/carry-forward")}>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold">Carry Forward Request</h3>
            <p className="text-sm text-gray-500 mt-2">Request to carry forward points</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}