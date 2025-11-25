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

export default function AcademicYearManager() {
  const [academicYears, setAcademicYears] = useState([]);
  const [currentYear, setCurrentYear] = useState("");
  const [newYear, setNewYear] = useState("");

  // Fetch all academic years
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["academicYears"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/all`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  // Fetch current academic year
  const { data: currentYearData } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/current`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.years) {
      setAcademicYears(data.years);
    }
  }, [data]);

  useEffect(() => {
    if (currentYearData?.year) {
      setCurrentYear(currentYearData.year);
    }
  }, [currentYearData]);

  const handleSetCurrentYear = async () => {
    if (!newYear) {
      toast.error("Please enter an academic year");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ year: newYear })
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Academic year set successfully");
        setNewYear("");
        refetch();
      } else {
        toast.error(result.error || "Failed to set academic year");
      }
    } catch (error) {
      toast.error("Failed to set academic year");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Academic Year Management</h1>

      {/* Set Current Academic Year */}
      <Card>
        <CardHeader>
          <CardTitle>Set Current Academic Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter academic year (e.g., 2025-26)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <Button onClick={handleSetCurrentYear}>
              Set as Current Year
            </Button>
          </div>
          {currentYear && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                Current Academic Year: <span className="font-bold">{currentYear}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Years List */}
      <Card>
        <CardHeader>
          <CardTitle>All Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading academic years...</p>
          ) : academicYears.length === 0 ? (
            <p className="text-center py-4">No academic years found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead>Ended At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Graduated</TableHead>
                    <TableHead>Pending Clearance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((year) => (
                    <TableRow key={year._id}>
                      <TableCell className="font-medium">{year.current}</TableCell>
                      <TableCell>
                        {year.startedAt ? new Date(year.startedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {year.endedAt ? new Date(year.endedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          year.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {year.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{year.totalStudents || 0}</TableCell>
                      <TableCell>{year.graduatedStudents || 0}</TableCell>
                      <TableCell>{year.pendingClearanceStudents || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}