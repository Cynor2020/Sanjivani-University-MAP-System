import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function TopWeakBranches() {
  const [limit, setLimit] = useState(10);

  // Fetch top/weak branches data
  const { data, isLoading } = useQuery({
    queryKey: ["topWeakBranches", limit],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports/top-weak-branches?limit=${limit}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Top & Weak Performing Branches</h1>

      {/* Limit Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Number of branches to display:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="border rounded p-2"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Top Performing Branches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading top branches...</p>
            ) : data?.topBranches?.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Rank</th>
                        <th className="text-left p-4">Department</th>
                        <th className="text-left p-4">Students</th>
                        <th className="text-left p-4">Avg Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topBranches.map((branch, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800">
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-4 font-medium">{branch.department}</td>
                          <td className="p-4">{branch.studentCount}</td>
                          <td className="p-4">
                            <span className="font-bold text-green-600">{branch.avgPoints}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.topBranches}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="department" 
                        type="category" 
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgPoints" name="Average Points" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-center py-4">No top branches data available</p>
            )}
          </CardContent>
        </Card>

        {/* Weak Performing Branches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Weak Performing Branches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading weak branches...</p>
            ) : data?.weakBranches?.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Rank</th>
                        <th className="text-left p-4">Department</th>
                        <th className="text-left p-4">Students</th>
                        <th className="text-left p-4">Avg Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.weakBranches.map((branch, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800">
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-4 font-medium">{branch.department}</td>
                          <td className="p-4">{branch.studentCount}</td>
                          <td className="p-4">
                            <span className="font-bold text-red-600">{branch.avgPoints}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.weakBranches}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="department" 
                        type="category" 
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgPoints" name="Average Points" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-center py-4">No weak branches data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparative Analysis */}
      {data?.topBranches && data?.weakBranches && (
        <Card>
          <CardHeader>
            <CardTitle>Comparative Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    ...data.topBranches.slice(0, 5).map(branch => ({
                      ...branch,
                      type: "Top"
                    })),
                    ...data.weakBranches.slice(0, 5).map(branch => ({
                      ...branch,
                      type: "Weak"
                    }))
                  ]}
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
                  <Bar dataKey="avgPoints" name="Average Points" fill="#8884d8">
                    {data.topBranches.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10B981" />
                    ))}
                    {data.weakBranches.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index + 5}`} fill="#EF4444" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}