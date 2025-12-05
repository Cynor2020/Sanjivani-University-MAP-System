import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { 
  Award, TrendingUp, Calendar, User
} from "lucide-react";

export default function MyPoints() {
  const [user, setUser] = useState(null);
  const [progressData, setProgressData] = useState(null);

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

  // Get progress color
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "from-green-500 to-emerald-600";
    if (percentage >= 80) return "from-blue-500 to-indigo-600";
    if (percentage >= 50) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  // Get badge class
  const getProgressBadgeClass = (percentage) => {
    if (percentage >= 100) return "bg-green-100 text-green-800 border-green-300";
    if (percentage >= 80) return "bg-blue-100 text-blue-800 border-blue-300";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  if (userLoading || progressLoading) {
    return <LoadingSkeleton />;
  }

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
              My Points
            </h1>
            <p className="text-gray-600 mt-2">View your points history across academic years</p>
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
              <p className="text-sm text-gray-600">Current Year</p>
              <p className="font-semibold text-gray-900">{user.currentYear}</p>
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress Summary */}
      {progressData && (
        <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Overall Points Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {user?.totalPoints || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Required Points</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {progressData.requiredPoints || 200}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {progressData.percentage || 0}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${getProgressColor(progressData.percentage || 0)}`}>
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year-wise Points History */}
      {progressData?.yearWise && progressData.yearWise.length > 0 && (
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span>Year-wise Points History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Academic Year</th>
                    <th className="text-left p-4">Points Earned</th>
                    <th className="text-left p-4">Required Points</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.yearWise.map((yearData, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold">{yearData.year} Year </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-900">{yearData.points || 0}</span>
                      </td>
                      <td className="p-4">{yearData.requiredPoints || 100}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getProgressBadgeClass(yearData.percentage || 0)}`}>
                          {yearData.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">{yearData.percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getProgressColor(yearData.percentage || 0)} h-2 rounded-full`}
                              style={{ width: `${Math.min(100, yearData.percentage || 0)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Year Progress */}
      {progressData && (
        <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-blue-600" />
              <span>Current Year Progress ({user?.currentYear} Year)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Points This Year</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {progressData.currentYearPoints || 0} / {progressData.currentYearRequired || 100}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${getProgressColor(progressData.currentYearPercentage || 0)} h-6 rounded-full transition-all duration-500 shadow-lg`}
                    style={{ width: `${Math.min(100, progressData.currentYearPercentage || 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium text-gray-600">
                    {progressData.currentYearPercentage || 0}% Complete
                  </span>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border-2 ${getProgressBadgeClass(progressData.currentYearPercentage || 0)}`}>
                    {progressData.currentYearPercentage >= 100 ? "Completed" : progressData.currentYearPercentage >= 80 ? "Excellent" : progressData.currentYearPercentage >= 50 ? "Good" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}