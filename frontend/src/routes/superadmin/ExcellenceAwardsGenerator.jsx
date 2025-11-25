import { useState } from "react";
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

export default function ExcellenceAwardsGenerator() {
  const [awardType, setAwardType] = useState("gold");
  const [awardedStudents, setAwardedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateAwards = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reports/excellence-awards?awardType=${awardType}`,
        { credentials: "include" }
      );
      const data = await res.json();
      
      if (res.ok) {
        setAwardedStudents(data.awardedStudents || []);
        toast.success(`Generated ${data.totalAwarded} excellence awards`);
      } else {
        toast.error(data.error || "Failed to generate awards");
      }
    } catch (error) {
      toast.error("Failed to generate awards");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // In a real implementation, this would generate a PDF
    toast.success("PDF export functionality would be implemented here");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Excellence Awards Generator</h1>
      </div>

      {/* Award Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Excellence Awards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Award Type</label>
              <select
                value={awardType}
                onChange={(e) => setAwardType(e.target.value)}
                className="border rounded p-2"
              >
                <option value="silver">Silver (50+ points)</option>
                <option value="gold">Gold (75+ points)</option>
                <option value="platinum">Platinum (90+ points)</option>
              </select>
            </div>
            <Button 
              onClick={generateAwards} 
              disabled={loading}
              className="mt-6"
            >
              {loading ? "Generating..." : "Generate Awards"}
            </Button>
            {awardedStudents.length > 0 && (
              <Button 
                onClick={exportToPDF} 
                variant="outline"
                className="mt-6"
              >
                Export to PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Awarded Students */}
      {awardedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {awardType.charAt(0).toUpperCase() + awardType.slice(1)} Award Recipients
              <span className="text-sm font-normal ml-2">
                ({awardedStudents.length} students)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Award</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awardedStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrollmentNumber || "N/A"}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.program}</TableCell>
                      <TableCell>
                        <span className="font-bold">{student.totalPoints}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.award === "Platinum" 
                            ? "bg-purple-100 text-purple-800" 
                            : student.award === "Gold" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {student.award}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{student.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Award Information */}
      <Card>
        <CardHeader>
          <CardTitle>Award Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <h3 className="font-bold text-lg text-gray-800">Silver Award</h3>
              <p className="text-2xl font-bold text-gray-600 mt-2">50+ Points</p>
              <p className="mt-2">Cash Reward: ₹2,000</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold text-lg text-yellow-600">Gold Award</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-2">75+ Points</p>
              <p className="mt-2">Cash Reward: ₹5,000</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold text-lg text-purple-600">Platinum Award</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">90+ Points</p>
              <p className="mt-2">Cash Reward: ₹10,000</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}