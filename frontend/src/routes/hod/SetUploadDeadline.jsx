import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../ProtectedRoute.jsx";
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

export default function SetUploadDeadline() {
  const { user } = useAuth();
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [deadlines, setDeadlines] = useState([]);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch current academic year
  const { data: academicYearData } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/current`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (academicYearData?.year) {
      setAcademicYear(academicYearData.year);
    }
    
    // Set department from user context
    if (user?.department) {
      setDepartment(user.department);
    }
  }, [academicYearData, user]);

  // Fetch existing deadlines
  const { data: deadlinesData, isLoading, refetch } = useQuery({
    queryKey: ["deadlines", page],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/deadlines/all?page=${page}&limit=10`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (deadlinesData?.deadlines) {
      setDeadlines(deadlinesData.deadlines);
    }
  }, [deadlinesData]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!department || !academicYear || !deadlineAt) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/deadlines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ department, academicYear, deadlineAt })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Deadline set successfully");
        // Reset form
        setDeadlineAt("");
        refetch();
        queryClient.invalidateQueries(["deadlines"]);
      } else {
        toast.error(data.error || "Failed to set deadline");
      }
    } catch (error) {
      toast.error("Failed to set deadline");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deadline?")) {
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/deadlines/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Deadline deleted successfully");
        refetch();
        queryClient.invalidateQueries(["deadlines"]);
      } else {
        toast.error(data.error || "Failed to delete deadline");
      }
    } catch (error) {
      toast.error("Failed to delete deadline");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Set Upload Deadline</h1>

      {/* Set Deadline Form */}
      <Card>
        <CardHeader>
          <CardTitle>Set New Deadline</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <input
                  className="w-full border rounded p-2"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year *</label>
                <input
                  className="w-full border rounded p-2"
                  placeholder="e.g., 2025-26"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deadline Date & Time *</label>
                <input
                  className="w-full border rounded p-2"
                  type="datetime-local"
                  value={deadlineAt}
                  onChange={(e) => setDeadlineAt(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit">
              Set Deadline
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading deadlines...</p>
          ) : deadlines.length === 0 ? (
            <p className="text-center py-4">No deadlines set yet</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Set By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadlines.map((deadline) => (
                      <TableRow key={deadline._id}>
                        <TableCell className="font-medium">{deadline.department}</TableCell>
                        <TableCell>{deadline.academicYear}</TableCell>
                        <TableCell>
                          {new Date(deadline.deadlineAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {deadline.updatedBy?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(deadline._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {deadlinesData?.pagination && deadlinesData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {deadlinesData.pagination.currentPage} of {deadlinesData.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === deadlinesData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}