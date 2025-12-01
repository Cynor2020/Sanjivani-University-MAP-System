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

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [academicYears, setAcademicYears] = useState([]);

  // Fetch certificates
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myCertificates", page, statusFilter, academicYearFilter],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/mine?page=${page}&limit=10&status=${statusFilter}&academicYear=${academicYearFilter}`, {
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

  // Fetch academic years for filter
  const { data: academicYearsData } = useQuery({
    queryKey: ["academicYears"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/academic-year/all`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (academicYearsData?.years) {
      setAcademicYears(academicYearsData.years.map(year => year.current));
    }
  }, [academicYearsData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) {
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success("Certificate deleted successfully");
        refetch();
      } else {
        toast.error(result.error || "Failed to delete certificate");
      }
    } catch (error) {
      toast.error("Failed to delete certificate");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Category",
      "Level",
      "Academic Year",
      "Status",
      "Points",
      "Submitted Date",
      "Event Name",
      "Event Date",
      "Organizer"
    ];
    
    const csvContent = [
      headers.join(","),
      ...certificates.map(cert => [
        `"${cert.title || ""}"`,
        `"${cert.categoryName || ""}"`,
        `"${cert.level || ""}"`,
        `"${cert.academicYear || ""}"`,
        `"${cert.status || ""}"`,
        `"${cert.pointsAllocated || 0}"`,
        `"${cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : ""}"`,
        `"${cert.eventName || ""}"`,
        `"${cert.eventDate ? new Date(cert.eventDate).toLocaleDateString() : ""}"`,
        `"${cert.organizer || ""}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "my_certificates.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Certificates exported to CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <Button onClick={exportToCSV} variant="outline">
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Academic Year</label>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">All Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => setPage(1)}>Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="text-center py-4">No certificates found</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert._id}>
                        <TableCell className="font-medium">{cert.title}</TableCell>
                        <TableCell>{cert.categoryName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cert.level}
                          </span>
                        </TableCell>
                        <TableCell>{cert.academicYear}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cert.status === "approved" 
                              ? "bg-green-100 text-green-800" 
                              : cert.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {cert.status}
                          </span>
                          {cert.status === "rejected" && cert.rejectionReason && (
                            <div className="text-xs text-red-600 mt-1">
                              Reason: {cert.rejectionReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${
                            cert.status === "approved" 
                              ? "text-green-600" 
                              : cert.status === "pending" 
                              ? "text-yellow-600" 
                              : "text-gray-500"
                          }`}>
                            {cert.pointsAllocated || "-"}
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
                            {(cert.status === "pending" || cert.status === "rejected") && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(cert._id)}
                              >
                                Delete
                              </Button>
                            )}
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