import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function PendingCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [academicYear, setAcademicYear] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
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
  }, [academicYearData]);

  // Fetch pending certificates
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pendingCertificatesHOD", page, academicYear, divisionFilter],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/pending/hod?page=${page}&limit=10&academicYear=${academicYear}&division=${divisionFilter}`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (data?.certificates) {
      setCertificates(data.certificates);
    }
  }, [data]);

  const handleApprove = async (certificateId, points) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ certificateId, points })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Certificate approved successfully");
        refetch();
        queryClient.invalidateQueries(["pendingCertificatesHOD"]);
      } else {
        toast.error(result.error || "Failed to approve certificate");
      }
    } catch (error) {
      toast.error("Failed to approve certificate");
    }
  };

  const handleReject = async (certificateId, reason) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ certificateId, reason })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Certificate rejected successfully");
        refetch();
        queryClient.invalidateQueries(["pendingCertificatesHOD"]);
      } else {
        toast.error(result.error || "Failed to reject certificate");
      }
    } catch (error) {
      toast.error("Failed to reject certificate");
    }
  };

  const handleReview = (certificate) => {
    // In a real implementation, this would open a modal or navigate to a review page
    const points = prompt("Enter points to allocate:", certificate.categoryId?.pointsByLevel?.[certificate.level] || 0);
    if (points !== null) {
      handleApprove(certificate._id, parseInt(points) || 0);
    }
  };

  const handleRejectWithReason = (certificate) => {
    const reason = prompt("Enter rejection reason:");
    if (reason !== null) {
      handleReject(certificate._id, reason);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pending Certificates</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Academic Year</label>
              <input
                type="text"
                placeholder="e.g., 2025-26"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Division</label>
              <input
                type="text"
                placeholder="Filter by division"
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => setPage(1)}>Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Certificates for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading pending certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="text-center py-4">No pending certificates found</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cert.userId?.name}</div>
                            <div className="text-sm text-gray-500">
                              {cert.userId?.enrollmentNumber} | {cert.userId?.division}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{cert.categoryName}</div>
                          <div className="text-sm text-gray-500">{cert.title}</div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cert.level}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(cert.cloudinaryUrl, "_blank")}
                            >
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleReview(cert)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectWithReason(cert)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {data.pagination.currentPage} of {data.pagination.totalPages}
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
                      disabled={page === data.pagination.totalPages}
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