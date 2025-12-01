import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function UniversityWideReports() {
  const [activeTab, setActiveTab] = useState("summary");
  const [departmentStats, setDepartmentStats] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [weakStudents, setWeakStudents] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [departments, setDepartments] = useState([]);
  const [departmentYears, setDepartmentYears] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentYear, setSelectedDepartmentYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [highestPoints, setHighestPoints] = useState("");
  const [lowestPoints, setLowestPoints] = useState("");

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch university summary
  const { data: summaryDataRes, isLoading: summaryLoading } = useQuery({
    queryKey: ["universitySummary"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/university`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch performance vs strength data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["performanceVsStrength"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/performance-vs-strength`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch top/weak branches data
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ["topWeakBranches"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/top-weak-branches`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch student leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["studentLeaderboard"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/leaderboard`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch detailed analytics data
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ["detailedAnalytics"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedDepartmentYear) params.append('departmentYear', selectedDepartmentYear);
      if (selectedCategory) params.append('category', selectedCategory);
      if (highestPoints) params.append('highestPoints', highestPoints);
      if (lowestPoints) params.append('lowestPoints', lowestPoints);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/detailed-analytics?${params.toString()}`, {
        credentials: "include"
      });
      return res.json();
    },
    enabled: false // We'll manually trigger this when filters change
  });

  useEffect(() => {
    if (departmentsData?.departments) {
      setDepartments(departmentsData.departments);
    }
  }, [departmentsData]);

  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(categoriesData.categories);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (summaryDataRes?.summary) {
      setSummaryData(summaryDataRes.summary);
    }
  }, [summaryDataRes]);

  useEffect(() => {
    if (performanceData?.performanceData) {
      setDepartmentStats(performanceData.performanceData);
    }
  }, [performanceData]);

  useEffect(() => {
    if (leaderboardData?.students) {
      setTopStudents(leaderboardData.students);
    }
  }, [leaderboardData]);

  // Apply filters
  const applyFilters = () => {
    refetchAnalytics();
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedDepartment("");
    setSelectedDepartmentYear("");
    setSelectedCategory("");
    setSearchTerm("");
    setHighestPoints("");
    setLowestPoints("");
  };

  const exportToCSV = async (type) => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedDepartmentYear) params.append('departmentYear', selectedDepartmentYear);
      if (selectedCategory) params.append('category', selectedCategory);
      if (highestPoints) params.append('highestPoints', highestPoints);
      if (lowestPoints) params.append('lowestPoints', lowestPoints);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/detailed-analytics/export?${params.toString()}`, {
        credentials: "include"
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'detailed_analytics_report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Report exported successfully");
      } else {
        toast.error("Failed to export report");
      }
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">University Wide Reports</h1>
        <Button onClick={() => exportToCSV('university')} variant="outline">
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Departments</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department Years</label>
              <select
                value={selectedDepartmentYear}
                onChange={(e) => setSelectedDepartmentYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
                <option value="Fourth">Fourth</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Activity Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Search Student</label>
              <input
                type="text"
                placeholder="Name or PRN"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Highest Points</label>
              <input
                type="number"
                placeholder="Minimum points"
                value={highestPoints}
                onChange={(e) => setHighestPoints(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Lowest Points</label>
              <input
                type="number"
                placeholder="Maximum points"
                value={lowestPoints}
                onChange={(e) => setLowestPoints(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summaryLoading ? (
        <p>Loading summary...</p>
      ) : summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{summaryData.totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Alumni</p>
              <p className="text-3xl font-bold text-green-600">{summaryData.totalAlumni}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Pending Clearance</p>
              <p className="text-3xl font-bold text-red-600">{summaryData.totalPendingClearance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Avg Points</p>
              <p className="text-3xl font-bold text-purple-600">{summaryData.avgPoints}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "summary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "performance"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("performance")}
          >
            Performance vs Strength
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "branches"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("branches")}
          >
            Top/Weak Branches
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "leaderboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Student Leaderboard
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "summary" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>University Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Certificate Statistics</h3>
                    {summaryLoading ? (
                      <p>Loading...</p>
                    ) : summaryData && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Certificates</span>
                          <span className="font-bold">{summaryData.totalCertificates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approved</span>
                          <span className="font-bold text-green-600">{summaryData.approvedCertificates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="font-bold text-yellow-600">{summaryData.pendingCertificates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejected</span>
                          <span className="font-bold text-red-600">{summaryData.rejectedCertificates}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Student Status Distribution</h3>
                    {summaryData && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Active', value: summaryData.totalStudents },
                              { name: 'Alumni', value: summaryData.totalAlumni },
                              { name: 'Pending Clearance', value: summaryData.totalPendingClearance }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Active', value: summaryData.totalStudents },
                              { name: 'Alumni', value: summaryData.totalAlumni },
                              { name: 'Pending Clearance', value: summaryData.totalPendingClearance }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "performance" && (
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Strength by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <p>Loading performance data...</p>
              ) : departmentStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Student Count</TableHead>
                          <TableHead>Avg Points</TableHead>
                          <TableHead>Total Points</TableHead>
                          <TableHead>Performance Index</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentStats.map((dept, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{dept.department}</TableCell>
                            <TableCell>{dept.studentCount}</TableCell>
                            <TableCell>
                              <span className="font-bold">{dept.avgPoints}</span>
                            </TableCell>
                            <TableCell>{dept.totalPoints}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{dept.performanceIndex}</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, dept.performanceIndex)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="studentCount" name="Student Count" fill="#8884d8" />
                        <Bar dataKey="avgPoints" name="Average Points" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4">No performance data available</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "branches" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {branchesLoading ? (
                  <p>Loading branches data...</p>
                ) : branchesData?.topBranches?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Avg Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branchesData.topBranches.map((branch, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{branch.department}</TableCell>
                              <TableCell>{branch.studentCount}</TableCell>
                              <TableCell>
                                <span className="font-bold text-green-600">{branch.avgPoints}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4">No top branches data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weak Performing Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {branchesLoading ? (
                  <p>Loading branches data...</p>
                ) : branchesData?.weakBranches?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Avg Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branchesData.weakBranches.map((branch, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{branch.department}</TableCell>
                              <TableCell>{branch.studentCount}</TableCell>
                              <TableCell>
                                <span className="font-bold text-red-600">{branch.avgPoints}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4">No weak branches data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <p>Loading leaderboard...</p>
              ) : topStudents.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Total Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topStudents.map((student, index) => (
                        <TableRow key={student._id}>
                          <TableCell>
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-amber-100 text-amber-800' :
                              'bg-white'
                            }`}>
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell>{student.program}</TableCell>
                          <TableCell>{student.currentYear}</TableCell>
                          <TableCell>
                            <span className="font-bold">{student.totalPoints}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center py-4">No leaderboard data available</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}