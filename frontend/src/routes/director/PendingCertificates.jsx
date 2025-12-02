import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import toast from "react-hot-toast";
import { Check, X, Eye, Filter } from "lucide-react";

export default function PendingCertificates() {
  const [sortBy, setSortBy] = useState("newest"); // newest or oldest
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentYear, setDepartmentYear] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentYears, setDepartmentYears] = useState([]);
  const queryClient = useQueryClient();

  // Fetch all departments for Director
  const { data: departmentsData } = useQuery({
    queryKey: ["allDepartments"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  useEffect(() => {
    if (departmentsData?.departments) {
      setDepartments(departmentsData.departments);
    }
  }, [departmentsData]);

  // When department is selected, populate department years
  useEffect(() => {
    if (department && departmentsData?.departments) {
      const selectedDept = departmentsData.departments.find(d => d._id === department);
      if (selectedDept?.years) {
        setDepartmentYears(selectedDept.years);
      } else {
        setDepartmentYears([]);
      }
    } else {
      setDepartmentYears([]);
    }
  }, [department, departmentsData]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pendingCertificates", sortBy, fromDate, toDate, department, departmentYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("sort", sortBy);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (department) params.append("department", department);
      if (departmentYear) params.append("year", departmentYear);
      
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/pending?${params}`,
        { credentials: "include" }
      );
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (certificateId) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/${certificateId}/approve`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingCertificates"]);
      toast.success("Certificate approved");
    },
    onError: () => toast.error("Failed to approve")
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ certificateId, reason }) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/${certificateId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason })
        }
      );
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingCertificates"]);
      toast.success("Certificate rejected");
      setSelectedCert(null);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject")
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading certificates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Certificates</h1>
        <p className="text-gray-600 mt-2">Review and approve/reject student certificates from all departments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none ${sortBy !== 'newest' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fromDate ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${toDate ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${department ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
                {department && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-8">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Year</label>
              <div className="relative">
                <select
                  value={departmentYear}
                  onChange={(e) => setDepartmentYear(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${departmentYear ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
                  disabled={!department}
                >
                  <option value="">All Years</option>
                  {departmentYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {departmentYear && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-8">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setSortBy("newest");
                setFromDate("");
                setToDate("");
                setDepartment("");
                setDepartmentYear("");
              }} 
              variant="outline"
            >
              Reset Filters
            </Button>
            <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Certificates ({data?.certificates?.length || 0})
            {(sortBy !== "newest" || fromDate || toDate || department || departmentYear) && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Filtered)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.certificates?.map((cert) => (
              <div key={cert._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{cert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{cert.userId?.name}</span> ({cert.userId?.prn}) - {cert.categoryName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Department: {cert.userId?.department?.name || "N/A"} | 
                      Year: {cert.userId?.currentYear || "N/A"} |
                      Level: <span className="capitalize">{cert.level}</span> | Points: {cert.pointsAllocated || 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted: {new Date(cert.createdAt).toLocaleDateString()} at {new Date(cert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    {cert.cloudinaryUrl && (
                      <a
                        href={cert.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Certificate
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(cert._id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {(!data?.certificates || data.certificates.length === 0) && (
              <div className="text-center py-8 text-gray-500">No pending certificates</div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCert && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle>Reject Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate({ certificateId: selectedCert._id, reason: rejectReason })}
              >
                Confirm Reject
              </Button>
              <Button variant="outline" onClick={() => {
                setSelectedCert(null);
                setRejectReason("");
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}