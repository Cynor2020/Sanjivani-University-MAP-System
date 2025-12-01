import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Award, Trophy, Medal } from "lucide-react";

export default function ExcellenceAwardsGenerator() {
  const { data, isLoading } = useQuery({
    queryKey: ["excellenceAwards"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reports/excellence-awards`,
        { credentials: "include" }
      );
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Excellence Awards</h1>
        <p className="text-gray-600 mt-2">Generate excellence awards for outstanding students</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800">Silver (200+)</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">
                  {data?.awards?.silver?.length || 0}
                </p>
                <p className="text-xs text-yellow-700 mt-1">₹3,000 each</p>
              </div>
              <Medal className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">Gold (250+)</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  {data?.awards?.gold?.length || 0}
                </p>
                <p className="text-xs text-amber-700 mt-1">₹5,000 each</p>
              </div>
              <Trophy className="h-12 w-12 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800">Platinum (300+)</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {data?.awards?.platinum?.length || 0}
                </p>
                <p className="text-xs text-purple-700 mt-1">₹10,000 each</p>
              </div>
              <Award className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platinum Awards */}
      {data?.awards?.platinum && data.awards.platinum.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span>Platinum Awards (300+ Points) - ₹10,000</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">PRN</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Points</th>
                    <th className="text-left p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.awards.platinum.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{student.name}</td>
                      <td className="p-3">{student.prn}</td>
                      <td className="p-3">{student.department?.name || "-"}</td>
                      <td className="p-3 font-bold text-purple-600">{student.totalPoints}</td>
                      <td className="p-3 font-bold">₹10,000</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gold Awards */}
      {data?.awards?.gold && data.awards.gold.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              <span>Gold Awards (250+ Points) - ₹5,000</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">PRN</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Points</th>
                    <th className="text-left p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.awards.gold.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{student.name}</td>
                      <td className="p-3">{student.prn}</td>
                      <td className="p-3">{student.department?.name || "-"}</td>
                      <td className="p-3 font-bold text-amber-600">{student.totalPoints}</td>
                      <td className="p-3 font-bold">₹5,000</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Silver Awards */}
      {data?.awards?.silver && data.awards.silver.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Medal className="h-5 w-5 text-yellow-600" />
              <span>Silver Awards (200+ Points) - ₹3,000</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">PRN</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">Points</th>
                    <th className="text-left p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.awards.silver.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{student.name}</td>
                      <td className="p-3">{student.prn}</td>
                      <td className="p-3">{student.department?.name || "-"}</td>
                      <td className="p-3 font-bold text-yellow-600">{student.totalPoints}</td>
                      <td className="p-3 font-bold">₹3,000</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.summary && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                Total Awards: {data.summary.total}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Platinum: {data.summary.platinum} | Gold: {data.summary.gold} | Silver: {data.summary.silver}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
